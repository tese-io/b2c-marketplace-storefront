'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';

import { getCountryCode } from '@/lib/i18n/locale';
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

const cardShell = 'tese-messages-card';

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
        countryCode: getCountryCode(String(locale || 'pl'))
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
          className="tese-messages-card-image"
        />
      ) : (
        <div className="tese-messages-card-image-placeholder">
          <span>No image</span>
        </div>
      )}
      <div className="tese-messages-card-body">
        <p className="tese-messages-card-title">{product.title}</p>
        {product.price && (
          <p className="tese-messages-card-price">
            {product.price.formatted ||
              convertToLocale({
                amount: product.price.amount,
                currency_code: product.price.currency_code
              })}
          </p>
        )}
        <div className="tese-messages-card-actions">
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="tese-messages-card-cta"
          >
            View product
          </LocalizedClientLink>
          {product.variant_id && (
            <button
              onClick={handleAddToCart}
              disabled={adding || added}
              className="tese-messages-card-secondary"
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
  pending: { label: 'Awaiting response', className: 'tese-messages-quote-chip--pending' },
  accepted: { label: 'Accepted', className: 'tese-messages-quote-chip--accepted' },
  declined: { label: 'Declined', className: 'tese-messages-quote-chip--declined' }
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
    <div className={cn(cardShell, 'tese-messages-card--quote')}>
      <div className="tese-messages-card-quote-head">
        <p className="tese-messages-card-quote-label">Quotation</p>
        <span className={cn('tese-messages-quote-chip', chip.className)}>
          {chip.label}
        </span>
      </div>

      <div className="tese-messages-card-body">
        <p className="tese-messages-card-price">
          {formatCardAmount(quotation.amount, quotation.currency_code)}
        </p>

        {!!quotation.items?.length && (
          <div className="tese-messages-quote-items">
            {quotation.items.map((item, i) => (
              <div key={i} className="tese-messages-quote-item">
                <span className="tese-messages-quote-item-title">{item.title}</span>
                <span className="tese-messages-quote-item-qty">
                  {item.quantity} ×{' '}
                  {formatCardAmount(item.unit_amount, quotation.currency_code)}
                </span>
              </div>
            ))}
          </div>
        )}

        {(quotation.moq || quotation.lead_time || quotation.payment_terms) && (
          <div className="tese-messages-quote-meta">
            {quotation.moq && <span>MOQ: {quotation.moq}</span>}
            {quotation.lead_time && <span>Lead time: {quotation.lead_time}</span>}
            {quotation.payment_terms && (
              <span>Payment: {quotation.payment_terms}</span>
            )}
          </div>
        )}

        {validUntil && !isNaN(validUntil.getTime()) && (
          <p
            className={cn(
              'tese-messages-quote-validity',
              expired && 'is-expired'
            )}
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
          <p className="tese-messages-quote-notes">{quotation.notes}</p>
        )}

        {canRespond && status === 'pending' && !expired && (
          <div className="tese-messages-quote-actions">
            <button
              onClick={() => respond('accepted')}
              disabled={!!responding}
              className="tese-messages-card-cta"
            >
              {responding === 'accepted' ? 'Accepting…' : 'Accept'}
            </button>
            <button
              onClick={() => respond('declined')}
              disabled={!!responding}
              className="tese-messages-card-secondary"
            >
              {responding === 'declined' ? 'Declining…' : 'Decline'}
            </button>
          </div>
        )}

        {quotation.enquiry_id && (
          <LocalizedClientLink
            href="/sourcing/inquiries"
            className="tese-messages-quote-link"
          >
            View in sourcing inquiries
          </LocalizedClientLink>
        )}
      </div>
    </div>
  );
}
