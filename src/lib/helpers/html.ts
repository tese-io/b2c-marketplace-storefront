import sanitizeHtml from 'sanitize-html'

/** True when the string contains at least one HTML tag. */
export function looksLikeHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text)
}

const ALLOWED_TAGS = [
  'p',
  'br',
  'span',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'a',
  'h3',
  'h4',
  'blockquote',
]

/**
 * Sanitizes rich-text product content (descriptions migrated from Shopify or
 * entered by vendors) for safe rendering via dangerouslySetInnerHTML. Allows
 * basic formatting + http(s) links only — scripts, event handlers, and
 * javascript:/data: URLs are stripped.
 */
export function sanitizeProductHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        },
      }),
    },
  })
}
