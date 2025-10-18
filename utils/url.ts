/**
 * Validates if a given text is a valid URL and returns the normalized URL with protocol.
 * 
 * @param text - The text to validate as a URL
 * @returns The normalized URL string with protocol, or null if not a valid URL
 * 
 * @example
 * isValidUrl('https://example.com') // returns 'https://example.com'
 * isValidUrl('example.com') // returns 'https://example.com'
 * isValidUrl('not a url') // returns null
 */
export function isValidUrl(text: string): string | null {
  const trimmed = text.trim();
  
  // Check if it already has a protocol
  if (trimmed.match(/^https?:\/\//i)) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return null;
    }
  }
  
  // Check if it looks like a URL (has domain pattern)
  // Must have at least one dot and valid characters
  const urlPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z0-9][a-zA-Z0-9-.]*(\/.*)?$/;
  if (urlPattern.test(trimmed)) {
    try {
      const withProtocol = `https://${trimmed}`;
      new URL(withProtocol);
      return withProtocol;
    } catch {
      return null;
    }
  }
  
  return null;
}

/**
 * Extracts the domain from a URL, removing the 'www.' prefix if present.
 * 
 * @param url - The URL to extract the domain from
 * @returns The domain name without 'www.', or the original URL if parsing fails
 * 
 * @example
 * getDomain('https://www.example.com/path') // returns 'example.com'
 * getDomain('https://github.com') // returns 'github.com'
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

