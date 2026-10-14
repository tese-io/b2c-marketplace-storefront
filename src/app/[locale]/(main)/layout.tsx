import { redirect } from 'next/navigation';

import { Footer, Header } from '@/components/organisms';
import { MatrixProvider } from '@/components/providers';
import { retrieveCustomer } from '@/lib/data/customer';
import { checkRegion } from '@/lib/helpers/check-region';
import { getCountryCode } from '@/lib/i18n/locale'

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeSegment } = await params;
  const locale = getCountryCode(localeSegment);

  const user = await retrieveCustomer();
  const regionCheck = await checkRegion(locale);

  if (!regionCheck) {
    return redirect('/');
  }

  if (!user?.id)
    return (
      <>
        <Header locale={locale} />
        {children}
        <Footer />
      </>
    );

  return (
    <MatrixProvider>
      <Header locale={locale} />
      {children}
      <Footer />
    </MatrixProvider>
  );
}
