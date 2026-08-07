'use server';

import { sdk } from '../config';
import { getCacheOptions } from './cookies';

export type StoreCertification = {
  slug: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  categories?: string[];
  aliases?: string[];
};

/**
 * Certifications catalogue, served by the marketplace backend from tese-backend.
 * Returns [] on any failure so callers can fall back to static content rather
 * than failing the page render.
 */
export const listCertifications = async (): Promise<StoreCertification[]> => {
  const next = {
    ...(await getCacheOptions('certifications')),
    revalidate: 3600
  };

  return sdk.client
    .fetch<{ certifications: StoreCertification[]; count: number }>(
      `/store/certifications`,
      {
        method: 'GET',
        next,
        cache: 'force-cache'
      }
    )
    .then(({ certifications }) => certifications ?? [])
    .catch(() => []);
};
