import type { Metadata } from "next"
import { Poppins } from 'next/font/google';

import './globals.css';

import { Toaster } from '@medusajs/ui';
import Head from 'next/head';

import { HtmlLangSetter } from '@/components/atoms/HtmlLangSetter/HtmlLangSetter';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/constants/brand';
import { retrieveCart } from '@/lib/data/cart';

import { Providers } from './providers';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: '/logo-icon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/apple-icon.png',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    languages: {
      'x-default': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    }
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cart = await retrieveCart();

  const ALGOLIA_APP = process.env.NEXT_PUBLIC_ALGOLIA_ID;
  // default lang updated by HtmlLangSetter
  const htmlLang = 'en';

  return (
    <html
      lang={htmlLang}
      className={poppins.variable}
    >
      <Head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://fonts.gstatic.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://i.imgur.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://i.imgur.com"
        />
        {ALGOLIA_APP && (
          <>
            <link
              rel="preconnect"
              href="https://algolia.net"
              crossOrigin="anonymous"
            />
            <link
              rel="preconnect"
              href="https://algolianet.com"
              crossOrigin="anonymous"
            />
            <link
              rel="dns-prefetch"
              href="https://algolia.net"
            />
            <link
              rel="dns-prefetch"
              href="https://algolianet.com"
            />
          </>
        )}
        {/* Image origins for faster LCP */}
        <link
          rel="preconnect"
          href="https://medusa-public-images.s3.eu-west-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://medusa-public-images.s3.eu-west-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://mercur-connect.s3.eu-central-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://mercur-connect.s3.eu-central-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://s3.eu-central-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://s3.eu-central-1.amazonaws.com"
        />
        {process.env.MEDUSA_BACKEND_URL?.startsWith('http') && (
          <>
            <link
              rel="preconnect"
              href={process.env.MEDUSA_BACKEND_URL}
              crossOrigin="anonymous"
            />
            <link
              rel="dns-prefetch"
              href={process.env.MEDUSA_BACKEND_URL}
            />
          </>
        )}
      </Head>
      <body className={`${poppins.className} relative bg-primary text-secondary antialiased`}>
        <HtmlLangSetter />
        <Providers cart={cart}>{children}</Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
