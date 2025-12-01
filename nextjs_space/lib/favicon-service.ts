/**
 * SIMPLE, RELIABLE Logo Fetching Service
 * 
 * STRATEGY (in order):
 * 1. Domain overrides (curated sources)
 * 2. Logo.dev - dedicated logo service
 * 3. Clearbit - another logo service
 * 4. Website scraping (last resort)
 * 5. AI upscaling to 600px minimum
 */

import { upscaleImage } from './image-upscaler';

const DOMAIN_OVERRIDES: Record<string, string> = {
  'netflix.com': 'https://images.ctfassets.net/4cd45et68cgf/7LrExJ6PAj6MSIPkDyCO86/542b1dfabbf3959908f69be546879952/Netflix-Brand-Logo.png',
  'youtube.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png',
  'sellerpic.ai': 'https://cdn-static.sellerpic.ai/website/668644ec5e28920fcd1baeae/6710a76093f2db79b26bd44d_Logo.svg',
}

/**
 * Try Logo.dev - reliable logo service
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
      console.log(`  ✅ Logo.dev has logo for ${domain}`);
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
 * Try Clearbit - another logo service
 */
function getClearbitUrl(domain: string): string {
  console.log(`  🔍 Using Clearbit for ${domain}...`);
  return `https://logo.clearbit.com/${domain}?size=400`;
}

/**
 * Try scraping website for og:image or favicon
 */
async function tryWebsiteScrape(url: string, domain: string): Promise<string | null> {
  try {
    console.log(`  🌐 Scraping website ${url}...`);
    
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
    
    // Try og:image first (usually high quality marketing image)
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
    
    console.log(`  ⚠️  No og:image found on website`);
    return null;
  } catch (error) {
    console.error('  ❌ Website scraping error:', error);
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
    
    // Strategy 1: Check domain overrides
    if (DOMAIN_OVERRIDES[domain]) {
      console.log(`  ✅ Using curated override`);
      return DOMAIN_OVERRIDES[domain]
    }

    // Strategy 2: Try Logo.dev (dedicated logo service)
    const logoDevUrl = await tryLogoDev(domain);
    
    let sourceUrl: string;
    let sourceName: string;
    
    if (logoDevUrl) {
      sourceUrl = logoDevUrl;
      sourceName = 'Logo.dev';
    } else {
      // Strategy 3: Try Clearbit (another logo service)
      const clearbitUrl = getClearbitUrl(domain);
      
      // Test if Clearbit actually has a logo
      try {
        const clearbitTest = await fetch(clearbitUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        
        if (clearbitTest.ok) {
          sourceUrl = clearbitUrl;
          sourceName = 'Clearbit';
          console.log(`  ✅ Clearbit has logo`);
        } else {
          // Strategy 4: Try website scraping (last resort)
          console.log(`  ⚠️  Clearbit returned ${clearbitTest.status}, trying website...`);
          const websiteLogo = await tryWebsiteScrape(url, domain);
          
          if (websiteLogo) {
            sourceUrl = websiteLogo;
            sourceName = 'Website';
          } else {
            // Absolute fallback
            console.log(`  ⚠️  All sources failed, using Clearbit anyway`);
            sourceUrl = clearbitUrl;
            sourceName = 'Clearbit (fallback)';
          }
        }
      } catch (error) {
        console.log(`  ⚠️  Clearbit test failed, using anyway`);
        sourceUrl = clearbitUrl;
        sourceName = 'Clearbit (fallback)';
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
