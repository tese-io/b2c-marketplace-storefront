import { notFound } from 'next/navigation';

import { SellerAvatar } from '@/components/cells/SellerAvatar/SellerAvatar';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { listSellers } from '@/lib/data/seller';
import { supplierDirectoryEnabled } from '@/lib/flags';

/**
 * B-17 / D-06 — the browsable supplier directory. Built complete,
 * launched DARK: while NEXT_PUBLIC_SUPPLIER_DIRECTORY_ENABLED is off
 * this route 404s, and nothing links to it. Turns on with one flag
 * after the Mauritius cohort is loaded (cut three).
 */

export const metadata = {
  title: 'Suppliers',
  description: 'Browse sustainable suppliers on the tese marketplace.',
};

export default async function SuppliersDirectoryPage() {
  if (!supplierDirectoryEnabled()) {
    notFound();
  }

  const { sellers } = await listSellers({ limit: 120 });

  return (
    <main className="tese-seller-page">
      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="heading-xl mb-2">Suppliers</h1>
        <p className="text-secondary mb-8">
          Sustainable materials and services suppliers on the tese
          marketplace.
        </p>

        {sellers.length === 0 ? (
          <p className="text-secondary" data-testid="directory-empty">
            No suppliers to show yet.
          </p>
        ) : (
          <ul
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            data-testid="directory-grid"
          >
            {sellers.map(seller => (
              <li key={seller.id}>
                <LocalizedClientLink
                  href={`/sellers/${seller.handle}`}
                  className="border-base hover:bg-component-secondary flex h-full flex-col gap-3 rounded-lg border p-5 transition-colors"
                  data-testid={`directory-card-${seller.handle}`}
                >
                  <div className="flex items-center gap-3">
                    <SellerAvatar photo={seller.photo || ''} size={40} alt={seller.name} />
                    <span className="font-semibold">{seller.name}</span>
                  </div>
                  {seller.description ? (
                    <p className="text-secondary line-clamp-3 text-sm">
                      {seller.description}
                    </p>
                  ) : null}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
