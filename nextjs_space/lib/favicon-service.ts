
/**
 * Favicon/Logo fetching service
 * Tries multiple high-quality sources to get the best logo
 * Priority: High-quality PNG with transparent background
 */

/**
 * Known domain overrides for problematic logos
 * These are manually curated to ensure correct logos
 */
const DOMAIN_OVERRIDES: Record<string, string> = {
  'netflix.com': 'https://images.ctfassets.net/4cd45et68cgf/7LrExJ6PAj6MSIPkDyCO86/542b1dfabbf3959908f69be546879952/Netflix-Brand-Logo.png',
  'youtube.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png',
  'amazon.com': 'https://logo.clearbit.com/amazon.com',
  'facebook.com': 'https://logo.clearbit.com/facebook.com',
  'twitter.com': 'https://logo.clearbit.com/twitter.com',
  'x.com': 'https://logo.clearbit.com/twitter.com',
  'instagram.com': 'https://logo.clearbit.com/instagram.com',
  'linkedin.com': 'https://logo.clearbit.com/linkedin.com',
  'github.com': 'https://logo.clearbit.com/github.com',
}

/**
 * Verify if an image URL is accessible and valid
 */
async function verifyImageUrl(imageUrl: string, timeout: number = 5000): Promise<boolean> {
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

/**
 * Try to fetch actual image content to verify it's not a placeholder
 */
async function verifyImageContent(imageUrl: string, timeout: number = 5000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(imageUrl, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return false;
    
    const blob = await response.blob();
    // Check if image size is reasonable (not too small - likely a placeholder)
    return blob.size > 500; // At least 500 bytes
  } catch (error) {
    return false;
  }
}

export async function fetchHighQualityFavicon(url: string): Promise<string | null> {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, ''); // Remove www. prefix

    // Check if we have a manual override for this domain
    if (DOMAIN_OVERRIDES[domain]) {
      console.log(`Using override for ${domain}`);
      return DOMAIN_OVERRIDES[domain];
    }

    // Define sources with priority order
    const sources = [
      // Clearbit Logo API - Highest quality PNG with transparent background
      {
        url: `https://pbs.twimg.com/media/F3LQ6oGagAECyUL.jpg`,
        name: 'Clearbit',
        verify: true,
        verifyContent: true,
      },
      // DuckDuckGo Icons - Very reliable
      {
        url: `https://upload.wikimedia.org/wikipedia/commons/d/d1/Favicon.ico.png`,
        name: 'DuckDuckGo',
        verify: true,
        verifyContent: false,
      },
      // Logo.dev - Another high-quality source
      {
        url: `https://upload.wikimedia.org/wikipedia/commons/c/ce/%2747_logo.svg`,
        name: 'Logo.dev',
        verify: true,
        verifyContent: false,
      },
      // Brandfetch - Good quality brand logos
      {
        url: `https://upload.wikimedia.org/wikipedia/en/5/5a/DomainGroup_Logo_STACK_RGB_GREEN.svg`,
        name: 'Brandfetch',
        verify: false, // API format, needs special handling
        verifyContent: false,
      },
      // Favicon Kit API
      {
        url: `https://api.faviconkit.com/${domain}/144`,
        name: 'FaviconKit',
        verify: true,
        verifyContent: false,
      },
      // Google's S2 Favicon Service - Reliable fallback (128px)
      {
        url: `https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Crunchbase_favicon.svg/2048px-Crunchbase_favicon.svg.png`,
        name: 'Google S2',
        verify: false, // Almost always works
        verifyContent: false,
      },
    ];

    // Try each source in order
    for (const source of sources) {
      try {
        console.log(`Trying ${source.name} for ${domain}...`);
        
        if (source.name === 'Brandfetch') {
          // Brandfetch requires special API handling
          const response = await fetch(source.url, {
            signal: AbortSignal.timeout(5000),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.icon?.formats && data.icon.formats.length > 0) {
              // Get the highest quality format
              const bestFormat = data.icon.formats.find((f: any) => f.format === 'png') || data.icon.formats[0];
              if (bestFormat?.src) {
                console.log(`✓ ${source.name} succeeded for ${domain}`);
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
            // Additional content verification for important sources
            if (source.verifyContent) {
              const hasContent = await verifyImageContent(source.url);
              if (hasContent) {
                console.log(`✓ ${source.name} succeeded for ${domain}`);
                return source.url;
              } else {
                console.log(`✗ ${source.name} returned placeholder for ${domain}`);
                continue;
              }
            }
            console.log(`✓ ${source.name} succeeded for ${domain}`);
            return source.url;
          } else {
            console.log(`✗ ${source.name} failed verification for ${domain}`);
          }
        } else {
          // For non-verified sources (like Google), just return directly
          console.log(`✓ ${source.name} (no verification) for ${domain}`);
          return source.url;
        }
      } catch (error) {
        console.log(`✗ ${source.name} errored for ${domain}:`, error);
        // Continue to next source
        continue;
      }
    }

    // Ultimate fallback - Google S2 (almost always works)
    console.log(`Using fallback Google S2 for ${domain}`);
    return `https://upload.wikimedia.org/wikipedia/commons/2/22/Wikipedia_favicon_in_Firefox_on_KDE_%282023%29.png`;
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
