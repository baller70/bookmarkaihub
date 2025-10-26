
/**
 * Website metadata fetching service
 * Fetches title, description, and other metadata from URLs
 */

export interface WebsiteMetadata {
  title: string;
  description: string;
  favicon: string;
}

export async function fetchWebsiteMetadata(url: string): Promise<WebsiteMetadata | null> {
  try {
    // Validate URL
    new URL(url);

    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // Extract metadata using regex (simple approach)
    const metadata: WebsiteMetadata = {
      title: '',
      description: '',
      favicon: '',
    };

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
    }

    // Try Open Graph title first
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogTitleMatch) {
      metadata.title = ogTitleMatch[1].trim();
    }

    // Extract description - try multiple sources
    const descriptionPatterns = [
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i,
    ];

    for (const pattern of descriptionPatterns) {
      const match = html.match(pattern);
      if (match) {
        metadata.description = match[1].trim();
        break;
      }
    }

    // Extract favicon
    const urlObj = new URL(url);
    const faviconPatterns = [
      /<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i,
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:icon|shortcut icon)["']/i,
    ];

    for (const pattern of faviconPatterns) {
      const match = html.match(pattern);
      if (match) {
        let faviconUrl = match[1];
        // Make absolute URL if relative
        if (faviconUrl.startsWith('/')) {
          faviconUrl = `${urlObj.protocol}//${urlObj.hostname}${faviconUrl}`;
        } else if (!faviconUrl.startsWith('http')) {
          faviconUrl = `${urlObj.protocol}//${urlObj.hostname}/${faviconUrl}`;
        }
        metadata.favicon = faviconUrl;
        break;
      }
    }

    // Fallback favicon
    if (!metadata.favicon) {
      metadata.favicon = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    }

    return metadata;
  } catch (error) {
    console.error('Error fetching website metadata:', error);
    return null;
  }
}
