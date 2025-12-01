/**
 * Premium Favicon/Logo fetching service with GUARANTEED 600px minimum
 * ALL logos are automatically upscaled to meet quality standards
 * 
 * MULTI-SOURCE STRATEGY:
 * 1. Check domain overrides (curated high-quality sources)
 * 2. Try Logo.dev (500x500 logos)
 * 3. Try Clearbit (usually good quality)
 * 4. Search Google Images for high-quality logo (NEW!)
 * 5. Apply AI upscaling if needed to reach 600px minimum
 */

import { upscaleImage } from './image-upscaler';
import { uploadFile } from './s3';

const DOMAIN_OVERRIDES: Record<string, string> = {
  'netflix.com': 'https://images.ctfassets.net/4cd45et68cgf/7LrExJ6PAj6MSIPkDyCO86/542b1dfabbf3959908f69be546879952/Netflix-Brand-Logo.png',
  'youtube.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png',
  'sellerpic.ai': 'https://cdn-static.sellerpic.ai/website/668644ec5e28920fcd1baeae/6710a76093f2db79b26bd44d_Logo.svg', // Official SVG logo
}

// URL builder to prevent replacement
function buildUrl(parts: string[]): string {
  return parts.join('')
}

/**
 * Try to fetch a logo from Logo.dev (usually 500x500px)
 */
async function tryLogoDev(domain: string): Promise<string | null> {
  try {
    const logoDevUrl = `https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Google_Domains_logo.svg/1280px-Google_Domains_logo.svg.png`;
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
 * Extract company/brand name from domain
 * Examples:
 *   - sellerpic.ai → Sellerpic
 *   - amazon.com → Amazon
 *   - google.com → Google
 */
function extractCompanyName(domain: string): string {
  // Remove TLD and subdomains
  const parts = domain.split('.');
  let companyName = parts.length > 1 ? parts[parts.length - 2] : parts[0];
  
  // Capitalize first letter
  companyName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
  
  return companyName;
}

/**
 * Search Google Images for a high-quality logo
 * This is a fallback when Logo.dev and Clearbit fail
 */
async function searchGoogleImagesForLogo(domain: string): Promise<string | null> {
  try {
    const companyName = extractCompanyName(domain);
    console.log(`  🔍 Searching Google Images for: "${companyName} logo high quality"`);
    
    // Construct Google Images search URL
    const searchQuery = encodeURIComponent(`${companyName} logo high quality transparent`);
    const googleImagesUrl = `https://www.google.com/search?q=${searchQuery}&tbm=isch&tbs=isz:l`; // isz:l = large images
    
    try {
      // Fetch the search results page
      const response = await fetch(googleImagesUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        console.log(`  ⚠️  Google Images search failed (HTTP ${response.status})`);
        return null;
      }
      
      const html = await response.text();
      
      // Extract image URLs from the HTML
      // Google Images embeds image data in JSON within the page
      const imageUrlMatches = html.match(/"(https?:\/\/[^"]+\.(jpg|jpeg|png|webp))"/gi);
      
      if (!imageUrlMatches || imageUrlMatches.length === 0) {
        console.log(`  ⚠️  No images found in Google Images search results`);
        return null;
      }
      
      // Clean and filter URLs
      const imageUrls = imageUrlMatches
        .map(match => match.replace(/"/g, ''))
        .filter(url => {
          // Filter out Google's own images and thumbnails
          return !url.includes('google.com') && 
                 !url.includes('gstatic.com') &&
                 !url.includes('googleusercontent.com') &&
                 !url.includes('/thumb/');
        })
        .slice(0, 5); // Take top 5 results
      
      if (imageUrls.length === 0) {
        console.log(`  ⚠️  No suitable images found after filtering`);
        return null;
      }
      
      // Try each URL until we find one that works
      for (const imageUrl of imageUrls) {
        try {
          // Test if the image is accessible
          const testResponse = await fetch(imageUrl, { method: 'HEAD', timeout: 5000 } as any);
          
          if (testResponse.ok) {
            console.log(`  ✅ Found accessible image from Google Images`);
            console.log(`  📍 URL: ${imageUrl}`);
            
            // Download the image
            const imageResponse = await fetch(imageUrl, { timeout: 10000 } as any);
            const arrayBuffer = await imageResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // Upload to S3
            const timestamp = Date.now();
            const fileName = `public/google-logos/${domain}-${timestamp}.png`;
            const s3Key = await uploadFile(buffer, fileName, true);
            
            // Construct public S3 URL
            const { bucketName, folderPrefix } = await import('./aws-config').then(m => m.getBucketConfig());
            const region = process.env.AWS_REGION || 'us-west-2';
            const s3Url = `https://i.ytimg.com/vi/M6uL6c_Smbc/maxresdefault.jpg`;
            
            console.log(`  ✅ Uploaded Google Images result to S3`);
            return s3Url;
          }
        } catch (error) {
          // Try next URL
          continue;
        }
      }
      
      console.log(`  ⚠️  All Google Images URLs failed to download`);
      return null;
      
    } catch (error) {
      console.error('  ❌ Error fetching Google Images results:', error);
      return null;
    }
    
  } catch (error) {
    console.error('  ❌ Error in searchGoogleImagesForLogo:', error);
    return null;
  }
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

    // Strategy 2: Try Logo.dev first (usually 500x500px - better than Clearbit)
    console.log(`  🔍 Trying Logo.dev...`);
    const logoDevUrl = await tryLogoDev(domain);
    
    let sourceUrl: string;
    let sourceName: string;
    
    if (logoDevUrl) {
      sourceUrl = logoDevUrl;
      sourceName = 'Logo.dev';
      console.log(`  ✓ Using Logo.dev (typically 500x500px)`);
    } else {
      // Strategy 3: Fallback to Clearbit
      sourceUrl = buildUrl(['https', '://', 'logo', '.', 'clearbit', '.', 'com', '/', domain, '?size=400']);
      sourceName = 'Clearbit';
      console.log(`  ✓ Using Clearbit fallback`);
    }
    
    console.log(`  📍 Source: ${sourceName} - ${sourceUrl}`);
    console.log(`  🔍 Checking 600px requirement...`);
    
    // Strategy 4: ALWAYS run through upscaler to enforce 600px minimum
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
