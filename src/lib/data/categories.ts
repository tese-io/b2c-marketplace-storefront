import { HttpTypes } from '@medusajs/types';

import { sdk } from '@/lib/config';

interface CategoriesProps {
  query?: Record<string, unknown>;
}

export const listCategories = async ({ query }: Partial<CategoriesProps> = {}) => {
  const limit = query?.limit || 100;

  const allCategories = await sdk.client
    .fetch<{
      product_categories: HttpTypes.StoreProductCategory[];
    }>('/store/product-categories', {
      query: {
        fields: 'id,handle,name,rank,metadata,parent_category_id,description,*category_children',
        include_descendants_tree: true,
        include_ancestors_tree: true,
        limit,
        ...query
      },
      cache: 'force-cache',
      next: { revalidate: 3600 }
    })
    .then(({ product_categories }) => product_categories);

  const parentCategories = allCategories.filter(cat => !cat.parent_category_id);

  const mainCategories = parentCategories.flatMap(parent => parent.category_children || []);

  const mainCategoriesWithChildren = mainCategories.map(mainCat => {
    const children = allCategories.filter(cat => cat.parent_category_id === mainCat.id);

    if (children.length > 0) {
      return {
        ...mainCat,
        category_children: children
      };
    }

    return mainCat;
  });

  return {
    parentCategories,
    categories: mainCategoriesWithChildren
  };
};

export const getCategoryByHandle = async (categoryHandle: string) => {
  const handle = decodeURIComponent(categoryHandle)

  // Handles like metals-&-alloys break Medusa's ?handle= query when & is not encoded.
  const { parentCategories } = await listCategories()
  const match = parentCategories.find((cat) => cat.handle === handle)

  if (match) return match

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(`/store/product-categories`, {
      query: {
        fields: 'id,handle,name,description,metadata,*category_children',
        handle,
      },
      cache: 'force-cache',
      next: { revalidate: 300 },
    })
    .then(({ product_categories }) => product_categories[0])
}

/** Safe path segment for category handles containing &, spaces, etc. */
export function categoryHref(handle: string, query = '') {
  return `/categories/${encodeURIComponent(handle)}${query}`
}
