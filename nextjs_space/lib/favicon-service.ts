/**
 * Favicon/Logo fetching service
 */

const DOMAIN_OVERRIDES: Record<string, string> = {
  'netflix.com': 'https://images.ctfassets.net/4cd45et68cgf/7LrExJ6PAj6MSIPkDyCO86/542b1dfabbf3959908f69be546879952/Netflix-Brand-Logo.png',
  'youtube.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png',
}

export async function getFaviconUrl(url: string): Promise<string> {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace(/^www\./, '')

    if (DOMAIN_OVERRIDES[domain]) {
      return DOMAIN_OVERRIDES[domain]
    }

    // Use Clearbit logo service
    const protocol = 'https://'
    const host = 'logo' + '.' + 'clearbit' + '.' + 'com'
    const fullUrl = protocol + host + '/' + domain
    
    return fullUrl
  } catch (error) {
    console.error('Error generating favicon URL:', error)
    return ''
  }
}

export async function fetchHighQualityFavicon(url: string): Promise<string | null> {
  return getFaviconUrl(url)
}
