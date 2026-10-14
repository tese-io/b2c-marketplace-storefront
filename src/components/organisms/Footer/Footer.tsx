import { TeseLogo } from "@/components/atoms/TeseLogo/TeseLogo"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import footerLinks from "@/data/footerLinks"
import { useTranslations } from "next-intl"
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants/brand"

export function Footer() {
  const t = useTranslations("footer")

  return (
    <footer className="tese-ink-surface text-white" data-testid="footer">
      <div className="tese-container py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <TeseLogo variant="light" className="mb-4" />
          <p className="text-sm text-white/60 leading-relaxed">
            {SITE_DESCRIPTION} {t("tagline")}
          </p>
          <LocalizedClientLink
            href="/sourcing"
            className="inline-flex mt-4 tese-cta rounded-full px-4 py-2 text-[13px] font-semibold"
          >
            {t("openSourcing")}
          </LocalizedClientLink>
        </div>

        <div data-testid="footer-customer-services">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide text-white/90">
            {t("buyerServices")}
          </h2>
          <nav className="space-y-2" aria-label={t("customerServicesNav")}>
            {footerLinks.customerServices.map(({ key, path }) => (
              <LocalizedClientLink
                key={key}
                href={path}
                className="block text-sm text-white/60 hover:text-tese-lime transition"
                data-testid={`footer-link-${key}`}
              >
                {t(`links.${key}`)}
              </LocalizedClientLink>
            ))}
          </nav>
        </div>

        <div data-testid="footer-about">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide text-white/90">
            {t("company")}
          </h2>
          <nav className="space-y-2" aria-label={t("aboutNav")}>
            {footerLinks.about.map(({ key, path }) => (
              <LocalizedClientLink
                key={key}
                href={path}
                className="block text-sm text-white/60 hover:text-tese-lime transition"
                data-testid={`footer-link-${key}`}
              >
                {t(`links.${key}`)}
              </LocalizedClientLink>
            ))}
          </nav>
        </div>

        <div data-testid="footer-connect">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide text-white/90">
            {t("connect")}
          </h2>
          <nav className="space-y-2" aria-label={t("socialNav")}>
            {footerLinks.connect.map(({ name, path }) => (
              <a
                aria-label={t("goToPage", { name })}
                title={t("goToPage", { name })}
                key={name}
                href={path}
                className="block text-sm text-white/60 hover:text-tese-lime transition"
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`footer-link-${name.toLowerCase()}`}
              >
                {name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10 py-6" data-testid="footer-copyright">
        <p className="text-sm text-white/50 text-center">
          © {new Date().getFullYear()} {SITE_NAME} — {t("copyright")}
        </p>
      </div>
    </footer>
  )
}
