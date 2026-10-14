'use client';

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition
} from '@headlessui/react';
import { Fragment } from 'react';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { LANGUAGE_NAMES, languagesOfferedIn, type SupportedLanguage } from '@/lib/i18n/config';
import { formatLocale, parseLocale } from '@/lib/i18n/locale';
import { cn } from '@/lib/utils';

/**
 * Switches the language half of the URL segment, leaving the market untouched —
 * so changing language never silently changes what a buyer pays or where we
 * ship. Renders nothing in markets where we only offer one language.
 */
export const LanguageSelector = ({ variant = 'default' }: { variant?: 'default' | 'header' }) => {
  const t = useTranslations('header');
  const { locale: localeSegment } = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const segment = String(localeSegment ?? '');
  const { language, countryCode } = parseLocale(segment);
  const available = languagesOfferedIn(countryCode);

  if (available.length < 2) {
    return null;
  }

  const handleChange = (next: SupportedLanguage) => {
    const restOfPath = pathname?.split(`/${segment}`)[1] ?? '';

    router.push(`/${formatLocale(next, countryCode)}${restOfPath}`);
    router.refresh();
  };

  const isHeader = variant === 'header';

  return (
    <div className="relative flex items-center">
      <Listbox
        value={language}
        onChange={handleChange}
      >
        <ListboxButton
          aria-label={t('changeLanguage')}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-primary transition-colors hover:bg-neutral-100',
            isHeader && 'text-xs'
          )}
        >
          <svg
            className="h-4 w-4 shrink-0 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3 7.5 7.03 7.5 12s2.015 9 4.5 9zM3.6 9h16.8M3.6 15h16.8"
            />
          </svg>
          <span className="font-medium uppercase">{language}</span>
        </ListboxButton>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions className="absolute right-0 top-full z-50 mt-1 min-w-[10rem] overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg focus:outline-none">
            {available.map(option => (
              <ListboxOption
                key={option}
                value={option}
                className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm text-primary data-[focus]:bg-neutral-100"
              >
                <span>{LANGUAGE_NAMES[option]}</span>
                <span className="text-xs uppercase text-secondary">{option}</span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </Listbox>
    </div>
  );
};
