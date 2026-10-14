import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import { getLanguage } from '@/lib/i18n/locale';

/**
 * Shared layout for every route group under `[locale]`.
 *
 * Its only job is to make the message catalog available to both server and
 * client components. Region resolution stays where it was — in middleware and
 * the individual group layouts — because the market half of the segment is a
 * separate concern from the language half.
 */
export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const language = getLanguage(locale);

  // Our segment is `{language}-{market}`, which next-intl cannot parse on its
  // own, so tell it which catalog this request wants before asking for messages.
  setRequestLocale(language);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider
      locale={language}
      messages={messages}
    >
      {children}
    </NextIntlClientProvider>
  );
}
