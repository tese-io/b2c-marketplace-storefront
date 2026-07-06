'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { useCartContext } from '@/components/providers';
import { convertToLocale } from '@/lib/helpers/money';
import { cn } from '@/lib/utils';

import {
  ProductCardPayload,
  QuotationPayload,
  formatCardAmount
} from './matrix-cards';

export type QuoteStatus = 'pending' | 'accepted' | 'declined';

const cardShell = 'w-64 overflow-hidden rounded-sm border bg-primary';

/** Product card shared into the chat — buyer view with commerce CTAs. */
export function ProductCardMessage({ card }: { card: ProductCardPayload }) {
  const { product } = card;
  const { locale } = useParams();
  const { addToCart } = useCartContext();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (!product.variant_id || adding) return;
    setAdding(true);
    try {
      await addToCart({
        variantId: product.variant_id,
        quantity: 1,
        countryCode: String(locale || 'pl')
      });
      setAdded(true);
    } catch (error) {
      console.error('Could not add to cart', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={cardShell}>
      {product.thumbnail ? (
        <Image
          src={decodeURIComponent(product.thumbnail)}
          alt={product.title}
          width={256}
          height={128}
          className="h-32 w-full object-cover"
        />
      ) : (
        <div className="flex h-32 w-full items-center justify-center bg-component-secondary">
          <span className="text-secondary text-sm">No image</span>
        </div>
      )}
      <div className="flex flex-col gap-1 px-3 py-2">
        <p className="truncate text-[15px] font-semibold">{product.title}</p>
        {product.price && (
          <p className="text-md font-semibold">
            {product.price.formatted ||
              convertToLocale({
                amount: product.price.amount,
                currency_code: product.price.currency_code
              })}
          </p>
        )}
        <div className="mt-1 flex flex-col gap-1.5">
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="bg-action text-action-on-primary block w-full rounded-sm px-3 py-1.5 text-center text-sm"
          >
            View product
          </LocalizedClientLink>
          {product.variant_id && (
            <button
              onClick={handleAddToCart}
              disabled={adding || added}
              className="block w-full rounded-sm border px-3 py-1.5 text-center text-sm disabled:opacity-60"
            >
              {added ? 'Added ✓' : adding ? 'Adding…' : 'Add to cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const statusChip: Record<QuoteStatus, { label: string; className: string }> = {
  pending: { label: '⏳ Awaiting response', className: 'bg-component-secondary' },
  accepted: { label: '✅ Accepted', className: 'bg-positive text-action-on-primary' },
  declined: { label: '❌ Declined', className: 'bg-component-secondary' }
};

/** Quotation card — buyer view with Accept / Decline actions. */
export function QuotationCardMessage({
  quotation,
  status = 'pending',
  canRespond = false,
  onRespond
}: {
  quotation: QuotationPayload;
  status?: QuoteStatus;
  /** True when the counterpart sent this quote and no response exists yet. */
  canRespond?: boolean;
  onRespond?: (status: 'accepted' | 'declined') => Promise<void>;
}) {
  const [responding, setResponding] = useState<'accepted' | 'declined' | null>(
    null
  );

  const validUntil = quotation.valid_until
    ? new Date(quotation.valid_until)
    : null;
  const expired =
    !!validUntil &&
    !isNaN(validUntil.getTime()) &&
    validUntil.getTime() < Date.now() - 24 * 60 * 60 * 1000;

  const chip = statusChip[status];

  const respond = async (answer: 'accepted' | 'declined') => {
    if (!onRespond || responding) return;
    setResponding(answer);
    try {
      await onRespond(answer);
    } finally {
      setResponding(null);
    }
  };

  return (
    <div className={cn(cardShell, 'w-72')}>
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <p className="text-md font-semibold">💰 Quotation</p>
        <span
          className={cn(
            'ml-auto rounded-full px-2 py-0.5 text-xs',
            chip.className
          )}
        >
          {chip.label}
        </span>
      </div>

      <div className="flex flex-col gap-2 px-3 py-2">
        <p className="text-lg font-semibold">
          {formatCardAmount(quotation.amount, quotation.currency_code)}
        </p>

        {!!quotation.items?.length && (
          <div className="flex flex-col gap-1 rounded-sm border px-2 py-1.5">
            {quotation.items.map((item, i) => (
              <div
                key={i}
                className="flex items-baseline justify-between gap-2 text-sm"
              >
                <span className="truncate">{item.title}</span>
                <span className="text-secondary shrink-0">
                  {item.quantity} ×{' '}
                  {formatCardAmount(item.unit_amount, quotation.currency_code)}
                </span>
              </div>
            ))}
          </div>
        )}

        {(quotation.moq || quotation.lead_time || quotation.payment_terms) && (
          <div className="text-secondary flex flex-col gap-0.5 text-sm">
            {quotation.moq && <span>MOQ: {quotation.moq}</span>}
            {quotation.lead_time && <span>Lead time: {quotation.lead_time}</span>}
            {quotation.payment_terms && (
              <span>Payment: {quotation.payment_terms}</span>
            )}
          </div>
        )}

        {validUntil && !isNaN(validUntil.getTime()) && (
          <p
            className={cn('text-sm', expired ? 'text-negative' : 'text-secondary')}
          >
            {expired ? 'Expired ' : 'Valid until '}
            {validUntil.toLocaleDateString([], {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </p>
        )}

        {quotation.notes && (
          <p className="text-secondary whitespace-pre-wrap text-sm">
            {quotation.notes}
          </p>
        )}

        {canRespond && status === 'pending' && !expired && (
          <div className="mt-1 flex gap-2">
            <button
              onClick={() => respond('accepted')}
              disabled={!!responding}
              className="bg-action text-action-on-primary flex-1 rounded-sm px-3 py-1.5 text-sm disabled:opacity-60"
            >
              {responding === 'accepted' ? 'Accepting…' : 'Accept'}
            </button>
            <button
              onClick={() => respond('declined')}
              disabled={!!responding}
              className="flex-1 rounded-sm border px-3 py-1.5 text-sm disabled:opacity-60"
            >
              {responding === 'declined' ? 'Declining…' : 'Decline'}
            </button>
          </div>
        )}

        {quotation.enquiry_id && (
          <LocalizedClientLink
            href="/sourcing/inquiries"
            className="text-sm underline"
          >
            View in sourcing inquiries
          </LocalizedClientLink>
        )}
      </div>
    </div>
  );
}
