import { HOME_TESTIMONIALS } from '@/data/homepage'
import { getTranslations } from 'next-intl/server'

function StarRow({ count }: { count: number }) {
  return (
    <div className="tese-testimonial-stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
          <path
            fill="currentColor"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      ))}
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export async function HomeTestimonials() {
  const t = await getTranslations("home.testimonials")
  return (
    <section className="tese-testimonials-section" aria-labelledby="home-testimonials-heading">
      <div className="tese-products-section-header">
        <div className="tese-products-section-intro">
          <p className="tese-products-eyebrow">
            <span className="tese-products-eyebrow-dot" aria-hidden />
            Buyer stories
          </p>
          <h2 id="home-testimonials-heading" className="tese-products-heading">
            What people are saying
          </h2>
          <p className="tese-products-subtitle">
            Procurement teams using tese.io to source certified, lower-carbon materials faster.
          </p>
        </div>
      </div>

      <div className="tese-testimonials-grid">
        {HOME_TESTIMONIALS.map((item, index) => (
          <article
            key={item.id}
            className="tese-testimonial-card"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <StarRow count={item.rating} />
            <blockquote className="tese-testimonial-quote">
              &ldquo;{t(`${item.id}.quote`)}&rdquo;
            </blockquote>
            <footer className="tese-testimonial-author">
              <div className="tese-testimonial-avatar" aria-hidden>
                {getInitials(item.name)}
              </div>
              <div>
                <p className="tese-testimonial-name">{item.name}</p>
                <p className="tese-testimonial-role">
                  {t(`${item.id}.role`)}, {item.company}
                </p>
              </div>
            </footer>
          </article>
        ))}
      </div>
    </section>
  )
}
