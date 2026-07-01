import { describe, expect, it } from 'vitest';

import { safeExternalHref } from './url';

describe('safeExternalHref', () => {
  it('allows http and https URLs', () => {
    expect(safeExternalHref('https://example.com/path')).toBe(
      'https://example.com/path'
    );
    expect(safeExternalHref('http://example.com')).toBe('http://example.com/');
  });

  it('rejects javascript: and data: URIs (XSS vectors)', () => {
    expect(safeExternalHref('javascript:alert(1)')).toBeUndefined();
    // eslint-disable-next-line no-script-url
    expect(safeExternalHref('JavaScript:alert(1)')).toBeUndefined();
    expect(safeExternalHref('data:text/html,<script>alert(1)</script>')).toBeUndefined();
    expect(safeExternalHref('vbscript:msgbox(1)')).toBeUndefined();
  });

  it('rejects empty, nullish, and non-URL strings', () => {
    expect(safeExternalHref(undefined)).toBeUndefined();
    expect(safeExternalHref(null)).toBeUndefined();
    expect(safeExternalHref('')).toBeUndefined();
    expect(safeExternalHref('not a url')).toBeUndefined();
    expect(safeExternalHref('/relative/path')).toBeUndefined();
  });

  it('trims surrounding whitespace before validating', () => {
    expect(safeExternalHref('  https://example.com  ')).toBe(
      'https://example.com/'
    );
  });
});
