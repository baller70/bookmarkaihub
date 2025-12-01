/**
 * Premium Logo Fetching Service with 600px minimum guarantee
 * 
 * STRATEGY:
 * 1. Domain overrides (curated sources)
 * 2. Brandfetch API (high-quality company logos)
 * 3. Logo.dev (fallback)
 * 4. Website og:image (last resort)
 * 5. AI upscaling to ensure 600px minimum
 */

import { upscaleImage } from './image-upscaler';

const DOMAIN_OVERRIDES: Record<string, string> = {
  'netflix.com': 'https://images.ctfassets.net/4cd45et68cgf/7LrExJ6PAj6MSIPkDyCO86/542b1dfabbf3959908f69be546879952/Netflix-Brand-Logo.png',
  'youtube.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png',
  'sellerpic.ai': 'https://cdn-static.sellerpic.ai/website/668644ec5e28920fcd1baeae/6710a76093f2db79b26bd44d_Logo.svg',
}

/**
 * Try Brandfetch - premium logo API with high quality
 */
async function tryBrandfetch(domain: string): Promise<string | null> {
  try {
    console.log(`  🔍 Trying Brandfetch for ${domain}...`);
    
    // Brandfetch has a free tier API
    const brandfetchUrl = `https://api.brandfetch.io/v2/brands/${domain}`;
    
    const response = await fetch(brandfetchUrl, {
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      console.log(`  ⚠️  Brandfetch returned ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Brandfetch returns multiple logo formats, get the highest quality one
    if (data.logos && data.logos.length > 0) {
      // Prefer PNG format, then SVG
      const pngLogo = data.logos.find((logo: any) => logo.formats?.some((f: any) => f.format === 'png'));
      const svgLogo = data.logos.find((logo: any) => logo.formats?.some((f: any) => f.format === 'svg'));
      
      const chosenLogo = pngLogo || svgLogo || data.logos[0];
      
      if (chosenLogo.formats && chosenLogo.formats.length > 0) {
        // Get the largest format available
        const format = chosenLogo.formats.sort((a: any, b: any) => 
          (b.width || 0) - (a.width || 0)
        )[0];
        
        if (format.src) {
          console.log(`  ✅ Brandfetch found logo: ${format.format} (${format.width}x${format.height})`);
          return format.src;
        }
      }
    }
    
    console.log(`  ⚠️  No suitable logo found in Brandfetch response`);
    return null;
  } catch (error) {
    console.log(`  ⚠️  Brandfetch error:`, error);
    return null;
  }
}

/**
 * Try Logo.dev
 */
async function tryLogoDev(domain: string): Promise<string | null> {
  try {
    console.log(`  🔍 Trying Logo.dev for ${domain}...`);
    const logoDevUrl = `https://img.logo.dev/${domain}?token=pk_X-1ZO13CQEePnALIwxDLTA&size=400`;
    
    const response = await fetch(logoDevUrl, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      console.log(`  ✅ Logo.dev has logo`);
      return logoDevUrl;
    }
    
    console.log(`  ⚠️  Logo.dev returned ${response.status}`);
    return null;
  } catch (error) {
    console.log(`  ⚠️  Logo.dev error:`, error);
    return null;
  }
}

/**
 * Try website og:image (last resort)
 */
async function tryWebsiteOgImage(url: string): Promise<string | null> {
  try {
    console.log(`  🌐 Trying website og:image...`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      console.log(`  ⚠️  Website fetch failed: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    
    // Only look for og:image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    
    if (ogImageMatch && ogImageMatch[1]) {
      let logoUrl = ogImageMatch[1];
      
      // Make URL absolute
      if (!logoUrl.startsWith('http')) {
        const urlObj = new URL(url);
        if (logoUrl.startsWith('//')) {
          logoUrl = `${urlObj.protocol}${logoUrl}`;
        } else if (logoUrl.startsWith('/')) {
          logoUrl = `${urlObj.protocol}//${urlObj.host}${logoUrl}`;
        } else {
          logoUrl = `${urlObj.protocol}//${urlObj.host}/${logoUrl}`;
        }
      }
      
      console.log(`  ✅ Found og:image: ${logoUrl.substring(0, 80)}...`);
      return logoUrl;
    }
    
    console.log(`  ⚠️  No og:image found`);
    return null;
  } catch (error) {
    console.error('  ❌ Website error:', error);
    return null;
  }
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

    // Strategy 2: Try Brandfetch (best quality)
    const brandfetchUrl = await tryBrandfetch(domain);
    
    let sourceUrl: string;
    let sourceName: string;
    
    if (brandfetchUrl) {
      sourceUrl = brandfetchUrl;
      sourceName = 'Brandfetch';
    } else {
      // Strategy 3: Try Logo.dev
      const logoDevUrl = await tryLogoDev(domain);
      
      if (logoDevUrl) {
        sourceUrl = logoDevUrl;
        sourceName = 'Logo.dev';
      } else {
        // Strategy 4: Try website og:image (last resort)
        const websiteUrl = await tryWebsiteOgImage(url);
        
        if (websiteUrl) {
          sourceUrl = websiteUrl;
          sourceName = 'Website og:image';
        } else {
          // Absolute fallback - empty string
          console.log(`  ❌ All sources failed`);
          return '';
        }
      }
    }
    
    console.log(`  📍 Source: ${sourceName} - ${sourceUrl.substring(0, 80)}...`);
    console.log(`  🔍 Upscaling to 600px minimum...`);
    
    // Strategy 5: Upscale to 600px minimum
    try {
      const result = await upscaleImage(sourceUrl, domain);
      
      if (result.success && result.upscaledUrl) {
        if (result.wasUpscaled) {
          console.log(`  ✅ Logo upscaled to 600px`);
        } else {
          console.log(`  ✅ Logo already 600px+`);
        }
        return result.upscaledUrl;
      } else {
        console.error(`  ❌ Upscaling failed: ${result.error}`);
        console.log(`  ⚠️  Using source URL`);
        return sourceUrl;
      }
    } catch (error) {
      console.error('  ❌ Upscaling error:', error);
      console.log(`  ⚠️  Using source URL`);
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
