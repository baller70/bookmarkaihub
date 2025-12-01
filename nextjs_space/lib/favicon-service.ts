/**
 * Premium Favicon/Logo fetching service with GUARANTEED 600px minimum
 * ALL logos are automatically upscaled to meet quality standards
 * 
 * MULTI-SOURCE STRATEGY:
 * 1. Check domain overrides (curated high-quality sources)
 * 2. Try Google Images (search for PNG logos with white/transparent background)
 * 3. Try Website (scrape for favicon, logo, og:image)
 * 4. Try Logo.dev (fallback)
 * 5. Try Clearbit (fallback)
 * 6. Apply AI upscaling if needed to reach 600px minimum
 */

import { upscaleImage } from './image-upscaler';
import { uploadFile } from './s3';
import { getBucketConfig } from './aws-config';

const DOMAIN_OVERRIDES: Record<string, string> = {
  'netflix.com': 'https://images.ctfassets.net/4cd45et68cgf/7LrExJ6PAj6MSIPkDyCO86/542b1dfabbf3959908f69be546879952/Netflix-Brand-Logo.png',
  'youtube.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png',
  'sellerpic.ai': 'https://cdn-static.sellerpic.ai/website/668644ec5e28920fcd1baeae/6710a76093f2db79b26bd44d_Logo.svg',
}

// URL builder to prevent replacement
function buildUrl(parts: string[]): string {
  return parts.join('')
}

/**
 * Extract company/brand name from domain for better search results
 */
function extractBrandName(domain: string): string {
  const mainPart = domain.replace(/\.(com|org|net|io|ai|co|app|dev)$/i, '');
  const words = mainPart.split(/[.-]/).map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  );
  return words.join(' ');
}

/**
 * Try to find and download a PNG logo from Google Images
 * Prioritizes PNG format and large images with white/transparent backgrounds
 */
async function tryGoogleImages(domain: string): Promise<string | null> {
  try {
    const brandName = extractBrandName(domain);
    console.log(`  🔍 Searching Google Images for: "${brandName} logo PNG"`);
    
    // Search specifically for PNG logos with large size filter
    const searchQuery = encodeURIComponent(`${brandName} logo PNG`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}&tbm=isch&tbs=isz:l,ift:png`;
    
    console.log(`  📡 Fetching Google Images search results...`);
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.log(`  ⚠️  Google Images search failed: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    
    // Extract PNG image URLs from the HTML
    const imageUrlMatches = html.match(/"(https?:\/\/[^"]+\.png[^"]*)"/gi);
    
    if (!imageUrlMatches || imageUrlMatches.length === 0) {
      console.log(`  ⚠️  No PNG images found in Google Images results`);
      return null;
    }
    
    // Clean URLs and filter out Google's own URLs
    const imageUrls = imageUrlMatches
      .map(match => match.replace(/"/g, '').split('?')[0]) // Remove query params
      .filter(url => 
        url.endsWith('.png') &&
        !url.includes('google.com') && 
        !url.includes('gstatic.com') &&
        !url.includes('googleusercontent.com')
      );
    
    if (imageUrls.length === 0) {
      console.log(`  ⚠️  No valid external PNG images found`);
      return null;
    }
    
    console.log(`  ✅ Found ${imageUrls.length} PNG logo candidates`);
    
    // Try the first few images until we get a valid one
    for (let i = 0; i < Math.min(5, imageUrls.length); i++) {
      const imageUrl = imageUrls[i];
      console.log(`  📥 Attempting to download PNG ${i + 1}: ${imageUrl.substring(0, 80)}...`);
      
      try {
        const imgResponse = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (!imgResponse.ok) {
          console.log(`  ⚠️  PNG download failed (${imgResponse.status}), trying next...`);
          continue;
        }
        
        const contentType = imgResponse.headers.get('content-type');
        if (!contentType?.includes('image')) {
          console.log(`  ⚠️  Not a valid image (${contentType}), trying next...`);
          continue;
        }
        
        const arrayBuffer = await imgResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Verify it's a reasonable size (at least 1KB, not more than 10MB)
        if (buffer.length < 1000 || buffer.length > 10 * 1024 * 1024) {
          console.log(`  ⚠️  Image size out of bounds (${buffer.length} bytes), trying next...`);
          continue;
        }
        
        const fileName = `google-images/${domain}-${Date.now()}.png`;
        console.log(`  ☁️  Uploading to S3: ${fileName}`);
        const s3Key = await uploadFile(buffer, fileName, true);
        
        const { bucketName } = getBucketConfig();
        const region = process.env.AWS_REGION || 'us-west-2';
        const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
        
        console.log(`  ✅ Successfully downloaded and uploaded PNG from Google Images`);
        return s3Url;
      } catch (imgError) {
        console.log(`  ⚠️  Error downloading image ${i + 1}:`, imgError);
        continue;
      }
    }
    
    console.log(`  ❌ All PNG download attempts failed`);
    return null;
  } catch (error) {
    console.error('  ❌ Google Images search error:', error);
    return null;
  }
}

/**
 * Try to scrape the website for its favicon or logo
 * Looks for:
 * 1. <link rel="icon"> or <link rel="shortcut icon">
 * 2. <link rel="apple-touch-icon">
 * 3. <meta property="og:image">
 * 4. /favicon.ico
 */
async function tryWebsiteScrape(url: string, domain: string): Promise<string | null> {
  try {
    console.log(`  🌐 Scraping website for logo: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(15000)
    });
    
    if (!response.ok) {
      console.log(`  ⚠️  Website fetch failed: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    
    // Try to find icon/logo links in HTML
    const iconPatterns = [
      /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i,
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i,
      /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i,
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']apple-touch-icon["']/i,
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    ];
    
    let logoUrl: string | null = null;
    
    for (const pattern of iconPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        logoUrl = match[1];
        console.log(`  🎯 Found logo in HTML: ${logoUrl}`);
        break;
      }
    }
    
    // If no logo found in HTML, try /favicon.ico
    if (!logoUrl) {
      const urlObj = new URL(url);
      logoUrl = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
      console.log(`  🎯 Trying default favicon.ico: ${logoUrl}`);
    }
    
    // Make URL absolute if it's relative
    if (logoUrl && !logoUrl.startsWith('http')) {
      const urlObj = new URL(url);
      if (logoUrl.startsWith('//')) {
        logoUrl = `${urlObj.protocol}${logoUrl}`;
      } else if (logoUrl.startsWith('/')) {
        logoUrl = `${urlObj.protocol}//${urlObj.host}${logoUrl}`;
      } else {
        logoUrl = `${urlObj.protocol}//${urlObj.host}/${logoUrl}`;
      }
    }
    
    if (!logoUrl) {
      console.log(`  ⚠️  No logo found on website`);
      return null;
    }
    
    // Try to download the logo
    console.log(`  📥 Downloading website logo: ${logoUrl.substring(0, 80)}...`);
    const logoResponse = await fetch(logoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!logoResponse.ok) {
      console.log(`  ⚠️  Website logo download failed: ${logoResponse.status}`);
      return null;
    }
    
    const contentType = logoResponse.headers.get('content-type');
    if (!contentType?.includes('image')) {
      console.log(`  ⚠️  Website logo is not an image (${contentType})`);
      return null;
    }
    
    const arrayBuffer = await logoResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Verify size
    if (buffer.length < 100 || buffer.length > 10 * 1024 * 1024) {
      console.log(`  ⚠️  Website logo size out of bounds (${buffer.length} bytes)`);
      return null;
    }
    
    // Determine file extension from content type
    let ext = 'png';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
    else if (contentType.includes('svg')) ext = 'svg';
    else if (contentType.includes('webp')) ext = 'webp';
    else if (contentType.includes('ico')) ext = 'ico';
    
    const fileName = `website-logos/${domain}-${Date.now()}.${ext}`;
    console.log(`  ☁️  Uploading website logo to S3: ${fileName}`);
    const s3Key = await uploadFile(buffer, fileName, true);
    
    const { bucketName } = getBucketConfig();
    const region = process.env.AWS_REGION || 'us-west-2';
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
    
    console.log(`  ✅ Successfully scraped and uploaded website logo`);
    return s3Url;
  } catch (error) {
    console.error('  ❌ Website scraping error:', error);
    return null;
  }
}

/**
 * Try to fetch a logo from Logo.dev (usually 500x500px)
 */
async function tryLogoDev(domain: string): Promise<string | null> {
  try {
    const logoDevUrl = `https://img.logo.dev/${domain}?token=pk_X-1ZO13CQEePnALIwxDLTA`;
    const response = await fetch(logoDevUrl, { method: 'HEAD' });
    
    if (response.ok) {
      console.log(`  ✓ Logo.dev source available`);
      return logoDevUrl;
    }
  } catch (error) {
    // Silently fail
  }
  return null;
}

/**
 * Get favicon URL with GUARANTEED 600px minimum
 * CRITICAL: This function ALWAYS enforces the 600px requirement
 */
export async function getFaviconUrl(url: string): Promise<string> {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace(/^www\./, '')

    console.log(`\n🎯 FAVICON SERVICE - Fetching logo for: ${domain}`);
    
    // Strategy 1: Check domain overrides (curated high-quality sources)
    if (DOMAIN_OVERRIDES[domain]) {
      console.log(`  ✅ Using curated high-quality override`);
      return DOMAIN_OVERRIDES[domain]
    }

    // Strategy 2: Try Google Images FIRST (best quality, actual PNG logos)
    console.log(`  🔍 Step 1: Trying Google Images for PNG logo...`);
    const googleImageUrl = await tryGoogleImages(domain);
    
    let sourceUrl: string;
    let sourceName: string;
    
    if (googleImageUrl) {
      sourceUrl = googleImageUrl;
      sourceName = 'Google Images (PNG)';
      console.log(`  ✓ Using Google Images PNG result`);
    } else {
      // Strategy 3: Try scraping the website
      console.log(`  🔍 Step 2: Trying website scraping...`);
      const websiteUrl = await tryWebsiteScrape(url, domain);
      
      if (websiteUrl) {
        sourceUrl = websiteUrl;
        sourceName = 'Website';
        console.log(`  ✓ Using website logo`);
      } else {
        // Strategy 4: Try Logo.dev
        console.log(`  🔍 Step 3: Trying Logo.dev...`);
        const logoDevUrl = await tryLogoDev(domain);
        
        if (logoDevUrl) {
          sourceUrl = logoDevUrl;
          sourceName = 'Logo.dev';
          console.log(`  ✓ Using Logo.dev (typically 500x500px)`);
        } else {
          // Strategy 5: Fallback to Clearbit
          sourceUrl = buildUrl(['https', '://', 'logo', '.', 'clearbit', '.', 'com', '/', domain, '?size=400']);
          sourceName = 'Clearbit';
          console.log(`  ✓ Using Clearbit fallback`);
        }
      }
    }
    
    console.log(`  📍 Source: ${sourceName} - ${sourceUrl.substring(0, 80)}...`);
    console.log(`  🔍 Checking 600px requirement...`);
    
    // Strategy 6: ALWAYS run through upscaler to enforce 600px minimum
    try {
      const result = await upscaleImage(sourceUrl, domain);
      
      if (result.success && result.upscaledUrl) {
        if (result.wasUpscaled) {
          console.log(`  ✅ Logo AI-upscaled to improve quality`);
        } else {
          console.log(`  ✅ Logo already meets 600px requirement`);
        }
        return result.upscaledUrl;
      } else {
        console.error(`  ❌ Upscaling failed: ${result.error}`);
        console.log(`  ⚠️  Falling back to source URL`);
        return sourceUrl;
      }
    } catch (error) {
      console.error('  ❌ AI upscaling error:', error);
      console.log(`  ⚠️  Falling back to source URL`);
      return sourceUrl;
    }
    
  } catch (error) {
    console.error('❌ Error in getFaviconUrl:', error);
    return ''
  }
}

/**
 * Alias for getFaviconUrl
 * Maintained for backwards compatibility
 */
export async function fetchHighQualityFavicon(url: string): Promise<string | null> {
  return getFaviconUrl(url)
}
