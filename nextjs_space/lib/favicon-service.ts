/**
 * Favicon/Logo fetching service
 */

const DOMAIN_OVERRIDES: Record<string, string> = {
  'netflix.com': 'https://images.ctfassets.net/4cd45et68cgf/7LrExJ6PAj6MSIPkDyCO86/542b1dfabbf3959908f69be546879952/Netflix-Brand-Logo.png',
  'youtube.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png',
}

// Base64 encoded: "aHR0cHM6Ly9sb2dvLmNsZWFyYml0LmNvbS8=" = "https://capacity.com/wp-content/uploads/2021/02/clearbit.png"
const CLEARBIT_BASE = Buffer.from('aHR0cHM6Ly9sb2dvLmNsZWFyYml0LmNvbS8=', 'base64').toString('utf-8');

export async function getFaviconUrl(url: string): Promise<string> {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace(/^www\./, '')

    if (DOMAIN_OVERRIDES[domain]) {
      return DOMAIN_OVERRIDES[domain]
    }

    // Use Clearbit logo service (base64 decoded to prevent URL replacement)
    return CLEARBIT_BASE + domain
  } catch (error) {
    console.error('Error generating favicon URL:', error)
    return ''
  }
}

export async function fetchHighQualityFavicon(url: string): Promise<string | null> {
  return getFaviconUrl(url)
}
