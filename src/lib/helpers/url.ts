/**
 * Returns the URL only if it is a safe external web link (http/https).
 *
 * React does not sanitize the `href` attribute, so rendering an untrusted URL
 * such as `javascript:...` or `data:...` directly is an XSS vector. Use this to
 * guard any href built from external/user-provided data (e.g. AI sourcing
 * results). Returns `undefined` for anything that isn't a valid http(s) URL so
 * callers can skip rendering the anchor.
 */
export function safeExternalHref(u?: string | null): string | undefined {
  if (!u || typeof u !== 'string') return undefined;
  try {
    const parsed = new URL(u.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      ? parsed.toString()
      : undefined;
  } catch {
    return undefined;
  }
}
