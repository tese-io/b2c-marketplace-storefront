/**
 * The languages and markets we serve.
 *
 * This file is data, not logic. Adding a language is one entry here plus a
 * catalog in `src/messages` — no type edits, no branching, nothing else to
 * touch. Everything downstream (the switcher, hreflang, fonts, text direction,
 * the parser's fallbacks) is derived from what is declared here.
 */

export type Script = 'latin' | 'devanagari';

export type Direction = 'ltr' | 'rtl';

/**
 * How far along a language is.
 *
 * - `ga`    — reviewed. Served, offered in the switcher, advertised to search engines.
 * - `beta`  — usable but not reviewed. Served when asked for and offered in the
 *             switcher, but never advertised in hreflang: we do not want search
 *             engines sending people to translations we have not signed off.
 * - `planned` — declared so the market mapping is complete, but not served at all.
 *
 * This is the incremental lever: a new language lands as `beta`, gets reviewed by
 * someone who speaks it, and is promoted to `ga` by changing one word.
 */
export type LanguageStatus = 'ga' | 'beta' | 'planned';

export type LanguageDefinition = {
  /** Name in the language itself — what the switcher shows. */
  endonym: string;
  script: Script;
  status: LanguageStatus;
  /**
   * Markets this language is offered in: ISO 3166-1 alpha-2 codes, or `all` for
   * the fallback language. A language is only ever offered where it is actually
   * spoken in trade, so we never advertise a page nobody asked for.
   */
  markets: readonly string[] | 'all';
};

/** Francophone markets: Europe, Canada, and West/Central Africa. */
const FRANCOPHONE = [
  'fr', 'be', 'ch', 'lu', 'mc', 'ca',
  'dz', 'ma', 'tn', 'sn', 'ci', 'cm', 'ml', 'bf', 'ne', 'td',
  'ga', 'cg', 'cd', 'mg', 'bj', 'tg', 'gn', 'rw', 'bi', 'dj', 'km', 'mr', 'cf'
] as const;

/** Lusophone markets: Europe, Brazil, and Southern Africa. */
const LUSOPHONE = ['pt', 'br', 'ao', 'mz', 'cv', 'gw', 'st', 'tl'] as const;

/** Swahili is the East African trade language. */
const SWAHILI_SPEAKING = ['ke', 'tz', 'ug', 'rw', 'bi', 'cd'] as const;

export const LANGUAGES = {
  en: { endonym: 'English', script: 'latin', status: 'ga', markets: 'all' },
  fr: { endonym: 'Français', script: 'latin', status: 'ga', markets: FRANCOPHONE },
  pt: { endonym: 'Português', script: 'latin', status: 'beta', markets: LUSOPHONE },
  hi: { endonym: 'हिन्दी', script: 'devanagari', status: 'beta', markets: ['in'] },
  sw: { endonym: 'Kiswahili', script: 'latin', status: 'beta', markets: SWAHILI_SPEAKING }
} as const satisfies Record<string, LanguageDefinition>;

export type SupportedLanguage = keyof typeof LANGUAGES;

/**
 * Reading direction per script. Every script we serve today is left-to-right;
 * this stays as the extension point because a right-to-left language changes
 * layout rather than just glyphs, and the root layout already reads it.
 */
export const SCRIPT_DIRECTION: Record<Script, Direction> = {
  latin: 'ltr',
  devanagari: 'ltr'
};

/** The language everything falls back to. Offered in every market. */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
