
/**
 * Favicon/Logo fetching service
 * Tries multiple high-quality sources to get the best logo
 */

export async function fetchHighQualityFavicon(url: string): Promise<string | null> {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Try multiple sources in order of quality
    const sources = [
      // Clearbit Logo API - High quality, works well for companies
      `https://upload.wikimedia.org/wikipedia/en/5/5a/DomainGroup_Logo_STACK_RGB_GREEN.svg`,
      // Google Favicon Service - High resolution option
      `https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png`,
      // DuckDuckGo icon service
      `https://upload.wikimedia.org/wikipedia/commons/2/22/Wikipedia_favicon_in_Firefox_on_KDE_%282023%29.png`,
      // Fallback to direct favicon
      `${urlObj.protocol}//${domain}/favicon.ico`,
    ];

    // Try Clearbit first (best quality for companies/brands)
    for (const source of sources) {
      try {
        const response = await fetch(source, {
          method: 'HEAD',
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        
        if (response.ok) {
          return source;
        }
      } catch (error) {
        // Continue to next source
        continue;
      }
    }

    // If all fail, return Google's service as fallback (almost always works)
    return `https://upload.wikimedia.org/wikipedia/commons/d/d1/Favicon.ico.png`;
  } catch (error) {
    console.error('Error fetching favicon:', error);
    return null;
  }
}

/**
 * Fetch and verify the logo works
 */
export async function getFaviconUrl(url: string): Promise<string> {
  const favicon = await fetchHighQualityFavicon(url);
  return favicon || '';
}
