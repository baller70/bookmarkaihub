/**
 * Simple Favicon Service - React-Friendly
 * 
 * Strategy:
 * 1. Domain overrides (curated sources)
 * 2. Google Favicon API
 * 3. DuckDuckGo Icons API
 * 4. Direct /favicon.ico
 * 5. Return empty string (no complex fallbacks)
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
  return 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=' + size;
}

/**
 * DuckDuckGo Icons API
 */
function getDuckDuckGoFavicon(domain: string): string {
  return 'https://icons.duckduckgo.com/ip3/' + domain + '.ico';
}

/**
 * Direct favicon.ico URL
 */
function getDirectFavicon(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol + '//' + urlObj.hostname + '/favicon.ico';
  } catch {
    return '';
  }
}

/**
 * Get favicon URL - Simple approach
 */
export async function getFaviconUrl(url: string): Promise<string> {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace(/^www\./, '')

    console.log('🎯 Favicon for: ' + domain);
    
    // 1. Check overrides
    if (DOMAIN_OVERRIDES[domain]) {
      console.log('  ✅ Override');
      return DOMAIN_OVERRIDES[domain]
    }

    // 2. Google API
    const googleUrl = getGoogleFavicon(domain, 128);
    console.log('  ✅ Google API');
    return googleUrl;
    
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
