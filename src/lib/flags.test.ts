import { afterEach, describe, expect, it } from 'vitest';

import { ratingsEnabled, supplierDirectoryEnabled } from './flags';

const RATINGS = 'NEXT_PUBLIC_RATINGS_ENABLED';
const DIRECTORY = 'NEXT_PUBLIC_SUPPLIER_DIRECTORY_ENABLED';

afterEach(() => {
  delete process.env[RATINGS];
  delete process.env[DIRECTORY];
});

describe('launch flags (D-05 / D-06)', () => {
  it('both default DARK — unset means off', () => {
    expect(ratingsEnabled()).toBe(false);
    expect(supplierDirectoryEnabled()).toBe(false);
  });

  it("only the literal 'true' turns a flag on", () => {
    process.env[RATINGS] = 'true';
    process.env[DIRECTORY] = 'true';
    expect(ratingsEnabled()).toBe(true);
    expect(supplierDirectoryEnabled()).toBe(true);
  });

  it('any other value stays off (no accidental launches)', () => {
    for (const v of ['1', 'TRUE', 'yes', 'on', '']) {
      process.env[RATINGS] = v;
      process.env[DIRECTORY] = v;
      expect(ratingsEnabled()).toBe(false);
      expect(supplierDirectoryEnabled()).toBe(false);
    }
  });
});
