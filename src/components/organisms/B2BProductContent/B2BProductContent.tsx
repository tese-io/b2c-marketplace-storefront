import {
  getProductAdvantages,
  getProductApplications,
  getProductMetadata,
} from '@/lib/helpers/product-procurement'
import {
  getProductAtAGlance,
  getProductCertificationList,
  getProductDocuments,
  getProductFaqs,
  getProductImpactMetrics,
  getProductKeyFeatures,
  getProductUseCases,
  PDP_EMPTY,
} from '@/lib/helpers/pdp-content'
import { PDP_SECTIONS } from '@/data/explorer-copy'
import { looksLikeHtml, sanitizeProductHtml } from '@/lib/helpers/html'
import { HttpTypes } from '@medusajs/types'

export function B2BProductContent({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const advantages = getProductAdvantages(product)
  const applications = getProductApplications(product)
  const keyFeatures = getProductKeyFeatures(product)
  const useCases = getProductUseCases(product)
  const impactMetrics = getProductImpactMetrics(product)
  const certifications = getProductCertificationList(product)
  const documents = getProductDocuments(product)
  const faqs = getProductFaqs(product)
  const atAGlance = getProductAtAGlance(product)
  const description = product.description?.trim()
  const meta = getProductMetadata(product)
  const hasImpactMeta =
    'environmentalImpactMetrics' in meta ||
    'useCases' in meta ||
    'esgMetrics' in meta
  const hasCertMeta = 'certifications' in meta || 'certificationsImages' in meta

  const benefits =
    keyFeatures.length > 0
      ? keyFeatures
      : advantages.map((a) => `${a.title}: ${a.body}`)

  const hasImpact = impactMetrics.length > 0 || useCases.length > 0

  if (
    !description &&
    !applications.length &&
    !benefits.length &&
    !hasImpact &&
    !certifications.length &&
    !documents.length &&
    !faqs.length &&
    !atAGlance.length
  ) {
    return null
  }

  return (
    <div className="tese-pdp-content-grid">
      {atAGlance.length > 0 && (
        <section className="tese-pdp-content-block" aria-labelledby="pdp-at-a-glance">
          <h2 id="pdp-at-a-glance" className="tese-pdp-content-heading">
            {PDP_SECTIONS.atAGlance}
          </h2>
          <ul className="tese-pdp-app-list">
            {atAGlance.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      {description && (
        <section className="tese-pdp-content-block" aria-labelledby="pdp-overview">
          <h2 id="pdp-overview" className="tese-pdp-content-heading">
            {PDP_SECTIONS.overview}
          </h2>
          <div
            className="tese-pdp-content-body"
            dangerouslySetInnerHTML={{ __html: formatDescription(description) }}
          />
        </section>
      )}

      {applications.length > 0 && (
        <section className="tese-pdp-content-block" aria-labelledby="pdp-applications">
          <h2 id="pdp-applications" className="tese-pdp-content-heading">
            {PDP_SECTIONS.applications}
          </h2>
          <ul className="tese-pdp-app-list">
            {applications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {benefits.length > 0 ? (
        <section className="tese-pdp-content-block" aria-labelledby="pdp-benefits">
          <h2 id="pdp-benefits" className="tese-pdp-content-heading">
            {PDP_SECTIONS.benefits}
          </h2>
          <ul className="tese-pdp-advantage-list">
            {benefits.map((item) => (
              <li key={item}>
                <span className="tese-pdp-advantage-body">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasImpact ? (
        <section className="tese-pdp-content-block" aria-labelledby="pdp-impact">
          <h2 id="pdp-impact" className="tese-pdp-content-heading">
            {PDP_SECTIONS.impact}
          </h2>
          <ul className="tese-pdp-advantage-list">
            {[...impactMetrics, ...useCases].map((item) => (
              <li key={`${item.title}-${item.body}`}>
                <span className="tese-pdp-advantage-title">{item.title}</span>
                <span className="tese-pdp-advantage-body">{item.body}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : hasImpactMeta ? (
        <section className="tese-pdp-content-block" aria-labelledby="pdp-impact-empty">
          <h2 id="pdp-impact-empty" className="tese-pdp-content-heading">
            {PDP_SECTIONS.impact}
          </h2>
          <p className="tese-pdp-content-body text-secondary">{PDP_EMPTY.impact}</p>
        </section>
      ) : null}

      {certifications.length > 0 ? (
        <section className="tese-pdp-content-block" aria-labelledby="pdp-certifications">
          <h2 id="pdp-certifications" className="tese-pdp-content-heading">
            {PDP_SECTIONS.certifications}
          </h2>
          <ul className="tese-pdp-app-list">
            {certifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : hasCertMeta ? (
        <section className="tese-pdp-content-block" aria-labelledby="pdp-certifications-empty">
          <h2 id="pdp-certifications-empty" className="tese-pdp-content-heading">
            {PDP_SECTIONS.certifications}
          </h2>
          <p className="tese-pdp-content-body text-secondary">{PDP_EMPTY.certifications}</p>
        </section>
      ) : null}

      {documents.length > 0 && (
        <section className="tese-pdp-content-block" aria-labelledby="pdp-documents">
          <h2 id="pdp-documents" className="tese-pdp-content-heading">
            {PDP_SECTIONS.documents}
          </h2>
          <ul className="tese-pdp-advantage-list">
            {documents.map((item) => (
              <li key={`${item.title}-${item.body}`}>
                <span className="tese-pdp-advantage-title">{item.title}</span>
                <span className="tese-pdp-advantage-body">{item.body}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="tese-pdp-content-block" aria-labelledby="pdp-faqs">
          <h2 id="pdp-faqs" className="tese-pdp-content-heading">
            {PDP_SECTIONS.faqs}
          </h2>
          <ul className="tese-pdp-advantage-list">
            {faqs.map((item) => (
              <li key={item.title}>
                <span className="tese-pdp-advantage-title">{item.title}</span>
                <span className="tese-pdp-advantage-body">{item.body}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function formatDescription(text: string) {
  // Rich-text descriptions (e.g. migrated from Shopify) are already HTML —
  // sanitize and render them. Plain text is escaped and split into paragraphs.
  if (looksLikeHtml(text)) {
    return sanitizeProductHtml(text)
  }
  const paragraphs = text.split(/\n\n+/).filter(Boolean)
  if (paragraphs.length > 1) {
    return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')
  }
  return `<p>${escapeHtml(text)}</p>`
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
