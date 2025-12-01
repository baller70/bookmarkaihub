/**
 * Simple Favicon Fetching Service
 * 
 * Uses reliable, free Favicon APIs:
 * - Google Favicon API
 * - DuckDuckGo Icons API
 */

const DOMAIN_OVERRIDES: Record<string, string> = {
  'netflix.com': 'https://images.ctfassets.net/4cd45et68cgf/7LrExJ6PAj6MSIPkDyCO86/542b1dfabbf3959908f69be546879952/Netflix-Brand-Logo.png',
  'youtube.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png',
  'sellerpic.ai': 'https://cdn-static.sellerpic.ai/website/668644ec5e28920fcd1baeae/6710a76093f2db79b26bd44d_Logo.svg',
}

/**
 * Google Favicon API - returns favicon for any domain
 */
function getGoogleFavicon(domain: string, size: number = 128): string {
  const baseUrl = 'https://www.google.com/s2/favicons';
  return `${baseUrl}?domain=${domain}&sz=${size}`;
}

/**
 * DuckDuckGo Icons API - reliable fallback
 */
function getDuckDuckGoFavicon(domain: string): string {
  const baseUrl = 'https://icons.duckduckgo.com/ip3';
  return `${baseUrl}/${domain}.ico`;
}

/**
 * Verify favicon URL is accessible
 */
async function verifyFaviconUrl(url: string): Promise<boolean> {
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
 * Get favicon URL using simple APIs
 */
export async function getFaviconUrl(url: string): Promise<string> {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace(/^www\./, '')

    console.log(`\n🎯 FAVICON SERVICE - ${domain}`);
    
    // 1. Check curated overrides
    if (DOMAIN_OVERRIDES[domain]) {
      console.log(`  ✅ Using curated override`);
      return DOMAIN_OVERRIDES[domain]
    }

    // 2. Try Google Favicon API
    const googleUrl = getGoogleFavicon(domain, 128);
    console.log(`  🔍 Trying Google Favicon API...`);
    
    const googleWorks = await verifyFaviconUrl(googleUrl);
    if (googleWorks) {
      console.log(`  ✅ Google Favicon API`);
      return googleUrl;
    }

    // 3. Try DuckDuckGo Icons API
    const duckUrl = getDuckDuckGoFavicon(domain);
    console.log(`  🔍 Trying DuckDuckGo Icons API...`);
    
    const duckWorks = await verifyFaviconUrl(duckUrl);
    if (duckWorks) {
      console.log(`  ✅ DuckDuckGo Icons API`);
      return duckUrl;
    }

    // No favicon found
    console.log(`  ❌ No favicon available`);
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
