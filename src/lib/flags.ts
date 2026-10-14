/**
 * Launch flags (Kuzi directives, 2026-09-22). Both dark by default:
 *
 *  - D-05 / B-18: star ratings + reviews render NOWHERE a buyer can
 *    reach until NEXT_PUBLIC_RATINGS_ENABLED=true (needs a moderation
 *    path first).
 *  - D-06 / B-17: the browsable supplier directory ships complete but
 *    invisible until NEXT_PUBLIC_SUPPLIER_DIRECTORY_ENABLED=true
 *    (turns on after the thirty Mauritius vendors are loaded).
 *
 * NEXT_PUBLIC_ so the same check works in server and client components.
 */

export const ratingsEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_RATINGS_ENABLED === 'true';

export const supplierDirectoryEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_SUPPLIER_DIRECTORY_ENABLED === 'true';
