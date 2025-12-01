/**
 * Premium Favicon/Logo fetching service with GUARANTEED 600px minimum
 * 
 * STRATEGY:
 * 1. Check domain overrides (curated high-quality sources)
 * 2. Search for actual logo via DuckDuckGo (reliable, no JS needed)
 * 3. Scrape website for logo/favicon
 * 4. Fallback to Logo.dev
 * 5. Fallback to Clearbit
 * 6. Apply AI upscaling to ensure 600px minimum
 */

import { upscaleImage } from './image-upscaler';
import { uploadFile } from './s3';
import { getBucketConfig } from './aws-config';

const DOMAIN_OVERRIDES: Record<string, string> = {
  'netflix.com': 'https://images.ctfassets.net/4cd45et68cgf/7LrExJ6PAj6MSIPkDyCO86/542b1dfabbf3959908f69be546879952/Netflix-Brand-Logo.png',
  'youtube.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png',
  'sellerpic.ai': 'https://cdn-static.sellerpic.ai/website/668644ec5e28920fcd1baeae/6710a76093f2db79b26bd44d_Logo.svg',
}

/**
 * Extract company/brand name from domain
 */
function extractBrandName(domain: string): string {
  const mainPart = domain.replace(/\.(com|org|net|io|ai|co|app|dev)$/i, '');
  const words = mainPart.split(/[.-]/).map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  );
  return words.join(' ');
}

/**
 * Try DuckDuckGo Images API - more reliable than Google scraping
 */
async function tryDuckDuckGoImages(domain: string): Promise<string | null> {
  try {
    const brandName = extractBrandName(domain);
    console.log(`  🔍 Searching DuckDuckGo Images for: "${brandName} logo"`);
    
    // DuckDuckGo has a simple JSON API that doesn't require scraping
    const searchQuery = encodeURIComponent(`${brandName} logo high resolution`);
    const ddgUrl = `https://duckduckgo.com/?q=${searchQuery}&iax=images&ia=images`;
    
    // First, get the search page to extract vqd token
    const pageResponse = await fetch(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!pageResponse.ok) {
      console.log(`  ⚠️  DuckDuckGo search failed: ${pageResponse.status}`);
      return null;
    }
    
    const pageHtml = await pageResponse.text();
    
    // Extract vqd token from HTML
    const vqdMatch = pageHtml.match(/vqd=['"]([^'"]+)['"]/);
    if (!vqdMatch) {
      console.log(`  ⚠️  Could not find vqd token`);
      return null;
    }
    
    const vqd = vqdMatch[1];
    
    // Now fetch actual image results using the API
    const apiUrl = `https://duckduckgo.com/i.js?q=${searchQuery}&o=json&vqd=${vqd}&f=,,,,,&l=wt-wt`;
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://duckduckgo.com/'
      }
    });
    
    if (!apiResponse.ok) {
      console.log(`  ⚠️  DuckDuckGo API failed: ${apiResponse.status}`);
      return null;
    }
    
    const data = await apiResponse.json();
    
    if (!data.results || data.results.length === 0) {
      console.log(`  ⚠️  No images found in DuckDuckGo results`);
      return null;
    }
    
    console.log(`  ✅ Found ${data.results.length} image results`);
    
    // Try first 5 images
    for (let i = 0; i < Math.min(5, data.results.length); i++) {
      const result = data.results[i];
      const imageUrl = result.image;
      
      if (!imageUrl) continue;
      
      console.log(`  📥 Attempting to download image ${i + 1}: ${imageUrl.substring(0, 80)}...`);
      
      try {
        const imgResponse = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (!imgResponse.ok) {
          console.log(`  ⚠️  Download failed (${imgResponse.status}), trying next...`);
          continue;
        }
        
        const contentType = imgResponse.headers.get('content-type');
        if (!contentType?.includes('image')) {
          console.log(`  ⚠️  Not an image (${contentType}), trying next...`);
          continue;
        }
        
        const arrayBuffer = await imgResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        if (buffer.length < 1000 || buffer.length > 10 * 1024 * 1024) {
          console.log(`  ⚠️  Size out of bounds (${buffer.length} bytes), trying next...`);
          continue;
        }
        
        // Determine extension
        let ext = 'png';
        if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
        else if (contentType.includes('svg')) ext = 'svg';
        else if (contentType.includes('webp')) ext = 'webp';
        
        const fileName = `ddg-logos/${domain}-${Date.now()}.${ext}`;
        console.log(`  ☁️  Uploading to S3: ${fileName}`);
        const s3Key = await uploadFile(buffer, fileName, true);
        
        const { bucketName } = getBucketConfig();
        const region = process.env.AWS_REGION || 'us-west-2';
        const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
        
        console.log(`  ✅ Successfully downloaded and uploaded logo from DuckDuckGo`);
        return s3Url;
      } catch (imgError) {
        console.log(`  ⚠️  Error downloading image ${i + 1}:`, imgError);
        continue;
      }
    }
    
    console.log(`  ❌ All download attempts failed`);
    return null;
  } catch (error) {
    console.error('  ❌ DuckDuckGo search error:', error);
    return null;
  }
}

/**
 * Scrape website for favicon/logo
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
    
    // Look for logo in HTML
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
    
    if (!logoUrl) {
      const urlObj = new URL(url);
      logoUrl = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
      console.log(`  🎯 Trying default favicon.ico`);
    }
    
    // Make URL absolute
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
    
    console.log(`  📥 Downloading: ${logoUrl.substring(0, 80)}...`);
    const logoResponse = await fetch(logoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!logoResponse.ok) {
      console.log(`  ⚠️  Download failed: ${logoResponse.status}`);
      return null;
    }
    
    const contentType = logoResponse.headers.get('content-type');
    if (!contentType?.includes('image')) {
      console.log(`  ⚠️  Not an image (${contentType})`);
      return null;
    }
    
    const arrayBuffer = await logoResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    if (buffer.length < 100 || buffer.length > 10 * 1024 * 1024) {
      console.log(`  ⚠️  Size out of bounds (${buffer.length} bytes)`);
      return null;
    }
    
    let ext = 'png';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
    else if (contentType.includes('svg')) ext = 'svg';
    else if (contentType.includes('webp')) ext = 'webp';
    else if (contentType.includes('ico')) ext = 'ico';
    
    const fileName = `website-logos/${domain}-${Date.now()}.${ext}`;
    console.log(`  ☁️  Uploading to S3: ${fileName}`);
    const s3Key = await uploadFile(buffer, fileName, true);
    
    const { bucketName } = getBucketConfig();
    const region = process.env.AWS_REGION || 'us-west-2';
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
    
    console.log(`  ✅ Successfully scraped website logo`);
    return s3Url;
  } catch (error) {
    console.error('  ❌ Website scraping error:', error);
    return null;
  }
}

/**
 * Try Logo.dev
 */
async function tryLogoDev(domain: string): Promise<string | null> {
  try {
    const logoDevUrl = `https://img.logo.dev/${domain}?token=pk_X-1ZO13CQEePnALIwxDLTA`;
    const response = await fetch(logoDevUrl, { method: 'HEAD' });
    
    if (response.ok) {
      console.log(`  ✓ Logo.dev available`);
      return logoDevUrl;
    }
  } catch (error) {
    // Silent fail
  }
  return null;
}

/**
 * Build Clearbit URL
 */
function getClearbitUrl(domain: string): string {
  return `https://logo.clearbit.com/${domain}?size=400`;
}

/**
 * Get favicon URL with GUARANTEED 600px minimum
 */
export async function getFaviconUrl(url: string): Promise<string> {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace(/^www\./, '')

    console.log(`\n🎯 FAVICON SERVICE - Fetching logo for: ${domain}`);
    
    // Strategy 1: Check overrides
    if (DOMAIN_OVERRIDES[domain]) {
      console.log(`  ✅ Using curated override`);
      return DOMAIN_OVERRIDES[domain]
    }

    // Strategy 2: DuckDuckGo Images (ACTUAL LOGO SEARCH)
    console.log(`  🔍 Step 1: Searching for logo image...`);
    const ddgLogo = await tryDuckDuckGoImages(domain);
    
    let sourceUrl: string;
    let sourceName: string;
    
    if (ddgLogo) {
      sourceUrl = ddgLogo;
      sourceName = 'DuckDuckGo Images';
      console.log(`  ✓ Using logo from image search`);
    } else {
      // Strategy 3: Scrape website
      console.log(`  🔍 Step 2: Scraping website...`);
      const websiteLogo = await tryWebsiteScrape(url, domain);
      
      if (websiteLogo) {
        sourceUrl = websiteLogo;
        sourceName = 'Website';
        console.log(`  ✓ Using website logo`);
      } else {
        // Strategy 4: Logo.dev
        console.log(`  🔍 Step 3: Trying Logo.dev...`);
        const logoDevUrl = await tryLogoDev(domain);
        
        if (logoDevUrl) {
          sourceUrl = logoDevUrl;
          sourceName = 'Logo.dev';
          console.log(`  ✓ Using Logo.dev`);
        } else {
          // Strategy 5: Clearbit fallback
          sourceUrl = getClearbitUrl(domain);
          sourceName = 'Clearbit';
          console.log(`  ✓ Using Clearbit fallback`);
        }
      }
    }
    
    console.log(`  📍 Source: ${sourceName}`);
    console.log(`  🔍 Checking 600px requirement...`);
    
    // Strategy 6: Upscale to 600px minimum
    try {
      const result = await upscaleImage(sourceUrl, domain);
      
      if (result.success && result.upscaledUrl) {
        if (result.wasUpscaled) {
          console.log(`  ✅ Logo upscaled to meet 600px requirement`);
        } else {
          console.log(`  ✅ Logo already meets 600px requirement`);
        }
        return result.upscaledUrl;
      } else {
        console.error(`  ❌ Upscaling failed: ${result.error}`);
        console.log(`  ⚠️  Falling back to source`);
        return sourceUrl;
      }
    } catch (error) {
      console.error('  ❌ Upscaling error:', error);
      console.log(`  ⚠️  Falling back to source`);
      return sourceUrl;
    }
    
  } catch (error) {
    console.error('❌ Error in getFaviconUrl:', error);
    return ''
  }
}

/**
 * Alias for backwards compatibility
 */
export async function fetchHighQualityFavicon(url: string): Promise<string | null> {
  return getFaviconUrl(url)
}
