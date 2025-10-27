/**
 * Favicon/Logo fetching service
 * Tries multiple high-quality sources to get the best logo
 * Priority: High-quality PNG with transparent background
 */

/**
 * Verify if an image URL is accessible and valid
 */
async function verifyImageUrl(imageUrl: string, timeout: number = 3000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(imageUrl, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return false;
    
    const contentType = response.headers.get('content-type');
    return contentType ? contentType.startsWith('image/') : false;
  } catch (error) {
    return false;
  }
}

export async function fetchHighQualityFavicon(url: string): Promise<string | null> {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, ''); // Remove www. prefix

    // Define sources with priority order
    const sources = [
      // Clearbit Logo API - Highest quality PNG with transparent background
      {
        url: `https://logo.clearbit.com/${domain}`,
        name: 'Clearbit',
        verify: true,
      },
      // Logo.dev - Another high-quality source
      {
        url: `https://img.logo.dev/${domain}?token=pk_X-NfVEJnQOaZbw_x3SvR9A&size=200`,
        name: 'Logo.dev',
        verify: true,
      },
      // Brandfetch - Good quality brand logos
      {
        url: `https://api.brandfetch.io/v2/logos/${domain}`,
        name: 'Brandfetch',
        verify: false, // API format, needs special handling
      },
      // Google's S2 Favicon Service - Reliable fallback (128px)
      {
        url: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        name: 'Google S2',
        verify: false, // Almost always works
      },
    ];

    // Try each source in order
    for (const source of sources) {
      try {
        if (source.name === 'Brandfetch') {
          // Brandfetch requires special API handling
          const response = await fetch(source.url, {
            signal: AbortSignal.timeout(3000),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.icon?.formats && data.icon.formats.length > 0) {
              // Get the highest quality format
              const bestFormat = data.icon.formats.find((f: any) => f.format === 'png') || data.icon.formats[0];
              if (bestFormat?.src) {
                return bestFormat.src;
              }
            }
          }
          continue;
        }
        
        if (source.verify) {
          // Verify the image is accessible
          const isValid = await verifyImageUrl(source.url);
          if (isValid) {
            return source.url;
          }
        } else {
          // For non-verified sources (like Google), just return directly
          return source.url;
        }
      } catch (error) {
        // Continue to next source
        continue;
      }
    }

    // Ultimate fallback - Google S2 (almost always works)
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
