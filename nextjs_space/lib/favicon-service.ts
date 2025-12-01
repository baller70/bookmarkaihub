/**
 * Comprehensive Favicon Fetching Service
 * 
 * Multi-layered fallback strategy:
 * 1. Domain overrides (curated sources)
 * 2. Google Favicon API
 * 3. DuckDuckGo Icons API
 * 4. Direct favicon.ico
 * 5. Parse HTML for favicon links
 */

const DOMAIN_OVERRIDES: Record<string, string> = {
  'netflix.com': 'https://images.ctfassets.net/4cd45et68cgf/7LrExJ6PAj6MSIPkDyCO86/542b1dfabbf3959908f69be546879952/Netflix-Brand-Logo.png',
  'youtube.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png',
  'sellerpic.ai': 'https://cdn-static.sellerpic.ai/website/668644ec5e28920fcd1baeae/6710a76093f2db79b26bd44d_Logo.svg',
}

/**
 * Google Favicon API
 */
function getGoogleFavicon(domain: string, size: number = 128): string {
  const baseUrl = 'https://www.google.com/s2/favicons';
  return baseUrl + '?domain=' + domain + '&sz=' + size;
}

/**
 * DuckDuckGo Icons API
 */
function getDuckDuckGoFavicon(domain: string): string {
  const baseUrl = 'https://icons.duckduckgo.com/ip3';
  return baseUrl + '/' + domain + '.ico';
}

/**
 * Verify URL is accessible
 */
async function verifyUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Try direct favicon.ico
 */
async function tryDirectFavicon(url: string): Promise<string | null> {
  try {
    const urlObj = new URL(url);
    const faviconUrl = urlObj.protocol + '//' + urlObj.hostname + '/favicon.ico';
    
    const works = await verifyUrl(faviconUrl);
    if (works) {
      return faviconUrl;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parse HTML for favicon links
 */
async function parseHtmlForFavicon(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    const urlObj = new URL(url);
    const baseUrl = urlObj.protocol + '//' + urlObj.hostname;
    
    // Try different favicon link patterns
    const patterns = [
      /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i,
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i,
      /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i,
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        let faviconUrl = match[1];
        
        // Make URL absolute
        if (faviconUrl.startsWith('//')) {
          faviconUrl = urlObj.protocol + faviconUrl;
        } else if (faviconUrl.startsWith('/')) {
          faviconUrl = baseUrl + faviconUrl;
        } else if (!faviconUrl.startsWith('http')) {
          faviconUrl = baseUrl + '/' + faviconUrl;
        }
        
        // Verify it works
        const works = await verifyUrl(faviconUrl);
        if (works) {
          return faviconUrl;
        }
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Get favicon URL with comprehensive fallback strategy
 */
export async function getFaviconUrl(url: string): Promise<string> {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace(/^www\./, '')

    console.log('\n🎯 FAVICON SERVICE - ' + domain);
    
    // 1. Check curated overrides
    if (DOMAIN_OVERRIDES[domain]) {
      console.log('  ✅ Curated override');
      return DOMAIN_OVERRIDES[domain]
    }

    // 2. Try Google Favicon API
    console.log('  🔍 Google Favicon API...');
    const googleUrl = getGoogleFavicon(domain, 128);
    if (await verifyUrl(googleUrl)) {
      console.log('  ✅ Google Favicon API');
      return googleUrl;
    }

    // 3. Try DuckDuckGo Icons API
    console.log('  🔍 DuckDuckGo Icons API...');
    const duckUrl = getDuckDuckGoFavicon(domain);
    if (await verifyUrl(duckUrl)) {
      console.log('  ✅ DuckDuckGo Icons API');
      return duckUrl;
    }

    // 4. Try direct favicon.ico
    console.log('  🔍 Direct favicon.ico...');
    const directFavicon = await tryDirectFavicon(url);
    if (directFavicon) {
      console.log('  ✅ Direct favicon.ico');
      return directFavicon;
    }

    // 5. Parse HTML for favicon links
    console.log('  🔍 Parsing HTML...');
    const htmlFavicon = await parseHtmlForFavicon(url);
    if (htmlFavicon) {
      console.log('  ✅ Found in HTML');
      return htmlFavicon;
    }

    // No favicon found
    console.log('  ❌ No favicon available');
    return '';
    
  } catch (error) {
    console.error('❌ Error:', error);
    return ''
  }
}

/**
 * Backwards compatibility
 */
export async function fetchHighQualityFavicon(url: string): Promise<string | null> {
  return getFaviconUrl(url)
}
