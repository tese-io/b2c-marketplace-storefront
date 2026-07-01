import {
  getProductAdvantages,
  getProductApplications,
} from '@/lib/helpers/product-procurement'
import { HttpTypes } from '@medusajs/types'

export function B2BProductContent({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const advantages = getProductAdvantages(product)
  const applications = getProductApplications(product)
  const description = product.description?.trim()

  if (!description && !advantages.length && !applications.length) return null

  return (
    <div className="tese-pdp-content-grid">
      {description && (
        <section className="tese-pdp-content-block" aria-labelledby="pdp-overview">
          <h2 id="pdp-overview" className="tese-pdp-content-heading">
            Overview
          </h2>
          <div
            className="tese-pdp-content-body"
            dangerouslySetInnerHTML={{ __html: formatDescription(description) }}
          />
        </section>
      )}

      {advantages.length > 0 && (
        <section className="tese-pdp-content-block" aria-labelledby="pdp-advantages">
          <h2 id="pdp-advantages" className="tese-pdp-content-heading">
            Advantages
          </h2>
          <ul className="tese-pdp-advantage-list">
            {advantages.map((item) => (
              <li key={item.title}>
                <span className="tese-pdp-advantage-title">{item.title}</span>
                <span className="tese-pdp-advantage-body">{item.body}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {applications.length > 0 && (
        <section className="tese-pdp-content-block" aria-labelledby="pdp-applications">
          <h2 id="pdp-applications" className="tese-pdp-content-heading">
            Applications
          </h2>
          <ul className="tese-pdp-app-list">
            {applications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function formatDescription(text: string) {
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
