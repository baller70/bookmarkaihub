/**
 * Favicon/Logo fetching service
 * Tries multiple high-quality sources to get the best logo
 * Priority: High-quality PNG with transparent background
 */

export async function fetchHighQualityFavicon(url: string): Promise<string | null> {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Try multiple sources in order of quality
    const sources = [
      // Clearbit Logo API - High quality PNG with transparent background
      `https://logo.clearbit.com/${domain}`,
      // Google's S2 Favicon Service - High resolution (up to 256px)
      `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
      // DuckDuckGo icon service - Usually good quality
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      // Fallback to direct favicon
      `${urlObj.protocol}//${domain}/favicon.ico`,
    ];

    // Try each source in order
    for (const source of sources) {
      try {
        const response = await fetch(source, {
          method: 'HEAD',
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        
        if (response.ok) {
          // For Clearbit, check if it's a valid image (they return 200 even for non-existent logos sometimes)
          if (source.includes('clearbit.com')) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.startsWith('image/')) {
              return source; // Clearbit returns high-quality PNG with transparent background
            }
            // If Clearbit fails, continue to next source
            continue;
          }
          return source;
        }
      } catch (error) {
        // Continue to next source
        continue;
      }
    }

    // If all fail, return Google's service as fallback (almost always works)
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
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
