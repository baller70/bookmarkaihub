/**
 * Logo Fetching Service - BRANDFETCH ONLY
 * 
 * STRATEGY:
 * 1. Domain overrides (curated sources)
 * 2. Brandfetch API (high-quality company logos)
 * 3. NO FALLBACKS - If Brandfetch doesn't have it, return empty string
 */

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
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      console.log(`  ❌ Brandfetch returned ${response.status} - NO LOGO AVAILABLE`);
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
    
    console.log(`  ❌ No logo found in Brandfetch response - NO LOGO AVAILABLE`);
    return null;
  } catch (error) {
    console.log(`  ❌ Brandfetch error: ${error} - NO LOGO AVAILABLE`);
    return null;
  }
}

/**
 * Get favicon URL - BRANDFETCH ONLY, NO FALLBACKS
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

    // Strategy 2: Try Brandfetch ONLY
    const brandfetchUrl = await tryBrandfetch(domain);
    
    if (brandfetchUrl) {
      console.log(`  ✅ SUCCESS - Logo from Brandfetch`);
      return brandfetchUrl;
    } else {
      // NO FALLBACKS - Return empty string
      console.log(`  ❌ FAILED - Brandfetch doesn't have logo for ${domain}`);
      console.log(`  ⚠️  Returning empty string (no fallbacks)`);
      return '';
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
