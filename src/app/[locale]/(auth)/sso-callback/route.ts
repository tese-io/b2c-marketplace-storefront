import { NextRequest, NextResponse } from 'next/server';

import { loginWithTeseSSO } from '@/lib/data/customer';
import { getPublicStorefrontOrigin } from '@/lib/helpers/public-origin';

export const dynamic = 'force-dynamic';

/**
 * Route handler for the tese SSO handoff. The tese dashboard redirects the user
 * here with a one-time `key` query param. A Route Handler (not a page) is
 * required because completing the login writes the `_medusa_jwt` cookie, and
 * cookies may only be mutated in a Server Action or Route Handler — not during
 * page render.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const key = req.nextUrl.searchParams.get('key');
  const redirectTo = req.nextUrl.searchParams.get('redirect') ?? '';
  const origin = getPublicStorefrontOrigin(req);

  if (!key) {
    return NextResponse.redirect(
      `${origin}/${locale}/login?error=sso_missing_key`
    );
  }

  const result = await loginWithTeseSSO(key);

  if (!result.success) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=sso_failed`);
  }

  return NextResponse.redirect(`${origin}/${locale}${redirectTo}`);
}
