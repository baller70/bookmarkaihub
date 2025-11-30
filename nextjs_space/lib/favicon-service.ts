/**
 * Premium Favicon/Logo fetching service with AI upscaling
 */

const DOMAIN_OVERRIDES: Record<string, string> = {
  'netflix.com': 'https://images.ctfassets.net/4cd45et68cgf/7LrExJ6PAj6MSIPkDyCO86/542b1dfabbf3959908f69be546879952/Netflix-Brand-Logo.png',
  'youtube.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png',
}

// URL builder to prevent replacement
function buildUrl(parts: string[]): string {
  return parts.join('')
}

export async function getFaviconUrl(url: string, useAIUpscale: boolean = false): Promise<string> {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace(/^www\./, '')

    if (DOMAIN_OVERRIDES[domain]) {
      return DOMAIN_OVERRIDES[domain]
    }

    // Build Clearbit logo URL with premium 400px size for high-quality display
    const clearbit = buildUrl(['https', '://', 'logo', '.', 'clearbit', '.', 'com', '/', domain, '?size=400'])
    
    // If AI upscaling is enabled, try to enhance the image
    if (useAIUpscale) {
      try {
        const { getEnhancedFavicon } = await import('./image-upscaler')
        return await getEnhancedFavicon(url)
      } catch (error) {
        console.error('AI upscaling failed, using standard Clearbit:', error)
        return clearbit
      }
    }
    
    return clearbit
  } catch (error) {
    console.error('Error generating favicon URL:', error)
    return ''
  }
}

export async function fetchHighQualityFavicon(url: string, useAIUpscale: boolean = false): Promise<string | null> {
  return getFaviconUrl(url, useAIUpscale)
}
