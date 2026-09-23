import { SellerProps } from '@/types/seller';

import { sdk } from '../config';

export type DirectorySeller = {
  id: string;
  name: string;
  handle: string;
  photo: string | null;
  description: string | null;
  created_at: string;
  store_status?: string;
};

/**
 * B-17 — the supplier directory listing. Only ACTIVE stores surface;
 * suspended sellers never appear on a public index.
 */
export const listSellers = async ({
  limit = 60,
  offset = 0
}: { limit?: number; offset?: number } = {}) => {
  return sdk.client
    .fetch<{ sellers: DirectorySeller[]; count: number }>('/store/seller', {
      query: {
        fields: 'id,name,handle,photo,description,created_at,store_status',
        limit,
        offset
      },
      cache: 'no-cache'
    })
    .then(({ sellers, count }) => ({
      sellers: (sellers || []).filter(
        s => s?.handle && (s.store_status ?? 'ACTIVE') === 'ACTIVE'
      ),
      count: count ?? 0
    }))
    .catch(() => ({ sellers: [] as DirectorySeller[], count: 0 }));
};

export const getSellerByHandle = async (handle: string) => {
  return sdk.client
    .fetch<{ seller: SellerProps }>(`/store/seller/${handle}`, {
      query: {
        fields:
          '+created_at,+email,+reviews.seller.name,+reviews.rating,+reviews.customer_note,+reviews.seller_note,+reviews.created_at,+reviews.updated_at,+reviews.customer.first_name,+reviews.customer.last_name'
      },
      cache: 'no-cache'
    })
    .then(({ seller }) => {
      const response = {
        ...seller,
        reviews:
          seller.reviews
            ?.filter(item => item !== null)
            .sort((a, b) => b.created_at.localeCompare(a.created_at)) ?? []
      };

      return response as SellerProps;
    })
    .catch(() => []);
};
