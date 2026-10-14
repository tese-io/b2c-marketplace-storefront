import { HttpTypes } from '@medusajs/types';
import { NextRequest, NextResponse } from 'next/server';

import { PROTECTED_ROUTES } from './lib/constants';
import { isTokenExpired } from './lib/helpers/token';
import { DEFAULT_LANGUAGE, LANGUAGE_HEADER } from './lib/i18n/config';
import { formatLocale, parseLocale } from './lib/i18n/locale';

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL;
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || 'us';

/** A composite `{language}-{market}` segment, e.g. `en-fr`. */
const COMPOSITE_SEGMENT = /^[a-z]{2}-[a-z]{2}$/i;
/** A legacy bare market segment, e.g. `fr`. */
const BARE_SEGMENT = /^[a-z]{2}$/i;

const makeAuthRedirect = (
  req: NextRequest,
  locale: string,
  reason: 'sessionRequired' | 'sessionExpired'
) => {
  const redirectUrl = new URL(`/${locale}/login`, req.url);

  redirectUrl.searchParams.set(reason, 'true');

  const response = NextResponse.redirect(redirectUrl);

  if (reason === 'sessionExpired') {
    response.cookies.delete('_medusa_jwt');
  }

  return response;
};

const passThrough = (request: NextRequest, language: string) => {
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set(LANGUAGE_HEADER, language);

  return NextResponse.next({ request: { headers: requestHeaders } });
};

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now()
};

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache;

  if (!BACKEND_URL) {
    throw new Error(
      'Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL.'
    );
  }

  if (!regionMap.keys().next().value || regionMapUpdated < Date.now() - 3600 * 1000) {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY!
      },
      next: {
        revalidate: 3600,
        tags: [`regions-${cacheId}`]
      },
      cache: 'force-cache'
    }).then(async response => {
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message);
      }

      return json;
    });

    if (!regions?.length) {
      throw new Error('No regions found. Please set up regions in your Medusa Admin.');
    }

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach(c => {
        regionMapCache.regionMap.set(c.iso_2 ?? '', region);
      });
    });

    regionMapCache.regionMapUpdated = Date.now();
  }

  return regionMapCache.regionMap;
}

/**
 * Resolves which market to serve when the URL does not already name a valid one:
 * the market in the URL if it exists, else the visitor's country, else the
 * configured default.
 */
async function resolveMarket(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>,
  urlMarket: string
) {
  try {
    let countryCode;

    const vercelCountryCode = request.headers.get('x-vercel-ip-country')?.toLowerCase();

    if (urlMarket && regionMap.has(urlMarket)) {
      countryCode = urlMarket;
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode;
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION;
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value;
    }

    return countryCode;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        'Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL.'
      );
    }
  }
}

export async function middleware(request: NextRequest) {
  // Short-circuit static assets
  if (request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const cacheIdCookie = request.cookies.get('_medusa_cache_id');
  const cacheId = cacheIdCookie?.value || crypto.randomUUID();

  const urlSegment = pathname.split('/')[1] ?? '';
  const isComposite = COMPOSITE_SEGMENT.test(urlSegment);
  const isBareMarket = !isComposite && BARE_SEGMENT.test(urlSegment);
  const hasLocaleSegment = isComposite || isBareMarket;

  const pathnameWithoutLocale = hasLocaleSegment ? pathname.replace(/^\/[^/]+/, '') : pathname;
  const queryString = request.nextUrl.search ?? '';

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathnameWithoutLocale.startsWith(route));

  if (isProtectedRoute) {
    const jwtCookie = request.cookies.get('_medusa_jwt');
    const token = jwtCookie?.value;

    const locale = isComposite
      ? urlSegment.toLowerCase()
      : formatLocale(DEFAULT_LANGUAGE, isBareMarket ? urlSegment : DEFAULT_REGION);

    // Not logged in before
    if (!jwtCookie) {
      return makeAuthRedirect(request, locale, 'sessionRequired');
    }

    // Token exists but expired
    if (token && isTokenExpired(token)) {
      return makeAuthRedirect(request, locale, 'sessionExpired');
    }
  }

  // A legacy `/{market}` URL maps deterministically onto `/{defaultLanguage}-{market}`,
  // so redirect permanently and let search engines forget the old shape.
  if (isBareMarket) {
    const canonical = formatLocale(DEFAULT_LANGUAGE, urlSegment);
    const redirectUrl = `${request.nextUrl.origin}/${canonical}${pathnameWithoutLocale}${queryString}`;

    return NextResponse.redirect(redirectUrl, 301);
  }

  const { language, countryCode: urlMarket } = parseLocale(urlSegment);

  // Fast path: the URL already carries both axes and we have a cache id.
  if (isComposite && cacheIdCookie) {
    return passThrough(request, language);
  }

  const response = passThrough(request, language);

  // Ensure cache id cookie exists (set without redirect)
  if (!cacheIdCookie) {
    response.cookies.set('_medusa_cache_id', cacheId, {
      maxAge: 60 * 60 * 24
    });
  }

  const regionMap = await getRegionMap(cacheId);
  const market = regionMap && (await resolveMarket(request, regionMap, urlMarket));

  if (!market) {
    return response;
  }

  // The URL already names a market we serve, in a language we serve.
  if (isComposite && market === urlMarket) {
    return response;
  }

  // Which market to serve depends on the visitor, so this one is temporary.
  const canonical = formatLocale(language, market);
  const redirectPath = hasLocaleSegment ? pathnameWithoutLocale : pathname === '/' ? '' : pathname;
  const redirectUrl = `${request.nextUrl.origin}/${canonical}${redirectPath}${queryString}`;

  return NextResponse.redirect(redirectUrl, 307);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)'
  ]
};
