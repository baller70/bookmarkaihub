/**
 * Premium Favicon/Logo Service
 * 
 * Multi-source strategy prioritizing HIGH-QUALITY logos:
 * 1. Domain overrides (curated, highest quality official sources)
 * 2. Clearbit Logo API (premium, high-quality SVG/PNG)
 * 3. Logo.dev (high-quality logos)
 * 4. Brandfetch (brand assets)
 * 5. Unavatar (aggregated logos)
 * 6. DuckDuckGo Icons (decent quality fallback)
 * 7. Google Favicon (last resort)
 * 
 * NO LOW-QUALITY SNAPSHOTS - Only premium sources
 */

// Curated high-quality logo sources for major brands
const DOMAIN_OVERRIDES: Record<string, string> = {
  'netflix.com': 'https://images.ctfassets.net/4cd45et68cgf/7LrExJ6PAj6MSIPkDyCO86/542b1dfabbf3959908f69be546879952/Netflix-Brand-Logo.png',
  'youtube.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png',
  'google.com': 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png',
  'facebook.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png',
  'twitter.com': 'https://abs.twimg.com/responsive-web/client-web/icon-ios.77d25eba.png',
  'x.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/X_icon_2.svg/2048px-X_icon_2.svg.png',
  'linkedin.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/768px-LinkedIn_logo_initials.png',
  'github.com': 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
  'amazon.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
  'apple.com': 'https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png',
  'microsoft.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/2560px-Microsoft_logo_%282012%29.svg.png',
  'spotify.com': 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png',
  'instagram.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/2048px-Instagram_logo_2022.svg.png',
  'tiktok.com': 'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png',
  'reddit.com': 'https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png',
  'pinterest.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Pinterest-logo.png/800px-Pinterest-logo.png',
  'sellerpic.ai': 'https://cdn-static.sellerpic.ai/website/668644ec5e28920fcd1baeae/6710a76093f2db79b26bd44d_Logo.svg',
  'jogg.ai': 'https://www.jogg.ai/favicon-96x96.png',
  'slack.com': 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png',
  'zoom.us': 'https://st1.zoom.us/static/6.3.13293/image/new/ZoomLogo.png',
  'notion.so': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/2048px-Notion-logo.svg.png',
  'figma.com': 'https://cdn.sanity.io/images/599r6htc/localized/46a76c802176eb17b04e12108de7e7e0f3736dc6-1024x1024.png',
  'canva.com': 'https://static.canva.com/web/images/12487a1e0770d29351bd4ce4f87ec8fe.svg',
  'medium.com': 'https://miro.medium.com/v2/1*m-R_BkNf1Qjr1YbyOIJY2w.png',
}

/**
 * Extract clean domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Verify if a URL returns a valid image
 */
async function verifyImageUrl(url: string, timeout: number = 3000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return false;
    
    const contentType = response.headers.get('content-type');
    return contentType?.startsWith('image/') || false;
  } catch {
    return false;
  }
}

/**
 * Try Clearbit Logo API (premium, high-quality)
 */
async function tryClearbitLogo(domain: string): Promise<string | null> {
  const url = 'https://logo.clearbit.com/' + domain;
  console.log('[Clearbit] Checking: ' + domain);
  
  if (await verifyImageUrl(url, 2000)) {
    console.log('[Clearbit] Found high-quality logo');
    return url;
  }
  return null;
}

/**
 * Try Logo.dev (high-quality logos)
 */
async function tryLogoDev(domain: string): Promise<string | null> {
  const url = 'https://img.logo.dev/' + domain + '?token=pk_X-LM61eDSGydDUXfpr_ivA&size=200';
  console.log('[Logo.dev] Checking: ' + domain);
  
  if (await verifyImageUrl(url, 2000)) {
    console.log('[Logo.dev] Found high-quality logo');
    return url;
  }
  return null;
}

/**
 * Try Brandfetch (brand assets)
 */
async function tryBrandfetch(domain: string): Promise<string | null> {
  const url = 'https://cdn.brandfetch.io/' + domain + '/fallback/lettermark/';
  console.log('[Brandfetch] Checking: ' + domain);
  
  if (await verifyImageUrl(url, 2000)) {
    console.log('[Brandfetch] Found high-quality logo');
    return url;
  }
  return null;
}

/**
 * Try Unavatar (aggregated logo sources)
 */
async function tryUnavatar(domain: string): Promise<string | null> {
  const url = 'https://unavatar.io/' + domain + '?fallback=false';
  console.log('[Unavatar] Checking: ' + domain);
  
  if (await verifyImageUrl(url, 2000)) {
    console.log('[Unavatar] Found high-quality logo');
    return url;
  }
  return null;
}

/**
 * Get DuckDuckGo favicon (decent quality fallback)
 */
function getDuckDuckGoFavicon(domain: string): string {
  return 'https://icons.duckduckgo.com/ip3/' + domain + '.ico';
}

/**
 * Get Google Favicon (last resort - lower quality)
 */
function getGoogleFavicon(domain: string): string {
  return 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=256';
}

/**
 * Main function - Get high-quality favicon/logo
 * 
 * STRATEGY (in order of priority):
 * 1. Domain overrides - Curated highest quality sources
 * 2. Clearbit - Premium commercial logo API
 * 3. Logo.dev - High-quality logo service
 * 4. Brandfetch - Brand asset platform
 * 5. Unavatar - Aggregated logo sources
 * 6. DuckDuckGo - Decent quality icons
 * 7. Google Favicon - Last resort (lower quality)
 */
export async function getFaviconUrl(url: string): Promise<string> {
  const domain = extractDomain(url);
  
  if (!domain) {
    console.error('[Favicon] Invalid URL');
    return '';
  }

  console.log('\n[Favicon Service] Fetching high-quality logo for: ' + domain);

  // 1. Check domain overrides (highest priority - curated sources)
  if (DOMAIN_OVERRIDES[domain]) {
    console.log('[Override] Using curated high-quality source');
    return DOMAIN_OVERRIDES[domain];
  }

  // 2. Try Clearbit (premium, high-quality)
  const clearbitLogo = await tryClearbitLogo(domain);
  if (clearbitLogo) return clearbitLogo;

  // 3. Try Logo.dev (high-quality)
  const logoDevLogo = await tryLogoDev(domain);
  if (logoDevLogo) return logoDevLogo;

  // 4. Try Brandfetch (brand assets)
  const brandfetchLogo = await tryBrandfetch(domain);
  if (brandfetchLogo) return brandfetchLogo;

  // 5. Try Unavatar (aggregated sources)
  const unavatarLogo = await tryUnavatar(domain);
  if (unavatarLogo) return unavatarLogo;

  // 6. DuckDuckGo Icons (decent quality fallback)
  const ddgFavicon = getDuckDuckGoFavicon(domain);
  console.log('[DuckDuckGo] Using decent quality fallback');
  
  // Verify DuckDuckGo icon exists
  if (await verifyImageUrl(ddgFavicon, 2000)) {
    return ddgFavicon;
  }

  // 7. Google Favicon (last resort - lower quality but always works)
  console.log('[Google] Using last resort (lower quality)');
  return getGoogleFavicon(domain);
}

/**
 * Backwards compatibility
 */
export async function fetchHighQualityFavicon(url: string): Promise<string | null> {
  return getFaviconUrl(url);
}
