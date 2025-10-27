
/**
 * Website metadata fetching service
 * Fetches title, description, and other metadata from URLs
 */

import { getFaviconUrl } from './favicon-service';

export interface WebsiteMetadata {
  title: string;
  description: string;
  favicon: string;
  suggestedTags: string[];
}

/**
 * Extract main title by removing taglines and suffixes
 * Examples:
 * "Netflix - Watch TV Shows Online" -> "Netflix"
 * "YouTube | Video Sharing" -> "YouTube"
 * "Amazon.com: Online Shopping" -> "Amazon"
 */
function extractMainTitle(fullTitle: string): string {
  if (!fullTitle) return '';
  
  // Remove common separators and everything after them
  const separators = [' - ', ' | ', ' :: ', ': ', ' — ', ' – '];
  
  let cleanTitle = fullTitle.trim();
  
  for (const separator of separators) {
    const index = cleanTitle.indexOf(separator);
    if (index > 0) {
      cleanTitle = cleanTitle.substring(0, index).trim();
      break;
    }
  }
  
  // Remove domain suffix if present (e.g., "Amazon.com" -> "Amazon")
  cleanTitle = cleanTitle.replace(/\.(com|net|org|io|co)$/i, '');
  
  return cleanTitle;
}

/**
 * Extract suggested tags from page content
 */
function extractSuggestedTags(html: string): string[] {
  const tags = new Set<string>();
  
  // Extract from meta keywords
  const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
  if (keywordsMatch) {
    const keywords = keywordsMatch[1].split(',').map(k => k.trim()).filter(k => k.length > 0 && k.length < 20);
    keywords.slice(0, 3).forEach(k => tags.add(k));
  }
  
  // Extract from og:type or article:tag
  const articleTags = html.matchAll(/<meta[^>]*(?:property|name)=["'](?:article:tag|og:type)["'][^>]*content=["']([^"']+)["']/gi);
  for (const match of articleTags) {
    if (match[1] && match[1].length < 20) {
      tags.add(match[1].trim());
    }
  }
  
  return Array.from(tags).slice(0, 5);
}

export async function fetchWebsiteMetadata(url: string): Promise<WebsiteMetadata | null> {
  try {
    // Validate URL
    const urlObj = new URL(url);

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
      suggestedTags: [],
    };

    // Extract title - prioritize og:title, then title tag
    let rawTitle = '';
    
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogTitleMatch) {
      rawTitle = ogTitleMatch[1].trim();
    } else {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        rawTitle = titleMatch[1].trim();
      }
    }
    
    // Extract only the main title (before separators)
    metadata.title = extractMainTitle(rawTitle) || urlObj.hostname.replace(/^www\./, '').split('.')[0];

    // Extract description - try multiple sources
    const descriptionPatterns = [
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i,
      /<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i,
    ];

    for (const pattern of descriptionPatterns) {
      const match = html.match(pattern);
      if (match) {
        metadata.description = match[1].trim();
        break;
      }
    }

    // Extract suggested tags
    metadata.suggestedTags = extractSuggestedTags(html);

    // Use the improved favicon service
    metadata.favicon = await getFaviconUrl(url);

    return metadata;
  } catch (error) {
    console.error('Error fetching website metadata:', error);
    return null;
  }
}
