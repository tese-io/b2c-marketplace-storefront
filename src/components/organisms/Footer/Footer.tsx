"use client"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import footerLinks from "@/data/footerLinks"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t" data-testid="footer">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand & Newsletter Section */}
            <div className="lg:col-span-4" data-testid="footer-brand">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  tese.io
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Your trusted marketplace for sustainable and ESG-compliant products.
                  Join us in building a greener future, one purchase at a time.
                </p>
              </div>

              {/* Newsletter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Stay Updated
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Subscribe to get special offers and sustainability news.
                </p>
                <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    aria-label="Email address for newsletter"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-200"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>

            {/* Customer Services Column */}
            <div className="lg:col-span-2" data-testid="footer-customer-services">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Customer Service
              </h3>
              <nav className="space-y-3" aria-label="Customer services navigation">
                {footerLinks.customerServices.map(({ label, path }) => (
                  <LocalizedClientLink
                    key={label}
                    href={path}
                    className="block text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                    data-testid={`footer-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {label}
                  </LocalizedClientLink>
                ))}
              </nav>
            </div>

            {/* About Column */}
            <div className="lg:col-span-2" data-testid="footer-about">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Company
              </h3>
              <nav className="space-y-3" aria-label="About navigation">
                {footerLinks.about.map(({ label, path }) => (
                  <LocalizedClientLink
                    key={label}
                    href={path}
                    className="block text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                    data-testid={`footer-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {label}
                  </LocalizedClientLink>
                ))}
              </nav>
            </div>

            {/* Quick Links Column */}
            <div className="lg:col-span-2" data-testid="footer-quick-links">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Quick Links
              </h3>
              <nav className="space-y-3" aria-label="Quick links navigation">
                {footerLinks.quickLinks.map(({ label, path }) => (
                  <LocalizedClientLink
                    key={label}
                    href={path}
                    className="block text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                    data-testid={`footer-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {label}
                  </LocalizedClientLink>
                ))}
              </nav>
            </div>

            {/* Connect Column */}
            <div className="lg:col-span-2" data-testid="footer-connect">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Connect With Us
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  {footerLinks.connect.map(({ label, path, icon }) => (
                    <a
                      aria-label={`Follow us on ${label}`}
                      title={`Follow us on ${label}`}
                      key={label}
                      href={path}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-green-600 hover:text-white transition-all duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`footer-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <span className="sr-only">{label}</span>
                      <span className="text-lg">{icon}</span>
                    </a>
                  ))}
                </div>
                <div className="pt-4">
                  <p className="text-xs text-gray-600 mb-2">We Accept</p>
                  <div className="flex gap-2 flex-wrap">
                    <div className="px-3 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700">
                      Visa
                    </div>
                    <div className="px-3 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700">
                      Mastercard
                    </div>
                    <div className="px-3 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700">
                      PayPal
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-6" data-testid="footer-copyright">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 text-center md:text-left">
              © {new Date().getFullYear()} tese.io – Sustainability & ESG Marketplace. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <LocalizedClientLink
                href="/privacy-policy"
                className="hover:text-green-600 transition-colors duration-200"
              >
                Privacy Policy
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/terms"
                className="hover:text-green-600 transition-colors duration-200"
              >
                Terms of Service
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/cookies"
                className="hover:text-green-600 transition-colors duration-200"
              >
                Cookie Policy
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
