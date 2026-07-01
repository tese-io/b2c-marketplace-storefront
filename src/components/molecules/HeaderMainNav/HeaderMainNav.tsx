"use client"

import { HttpTypes } from "@medusajs/types"
import { useState } from "react"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getCategoryVisual } from "@/components/organisms/CategoryCardB2B/category-visuals"
import { HOME_SERVICES } from "@/data/homepage"
import { SECTORS, type SectorId } from "@/data/sectors"
import { getSectorVisual } from "@/data/sector-visuals"
import { cn } from "@/lib/utils"
import Cookies from "js-cookie"
import { useSearchParams } from "next/navigation"
import {
  buildCatalogQuery,
  SECTOR_COOKIE,
} from "@/lib/helpers/sector-preferences"
import { categoryHref } from "@/lib/data/categories"

import { MegaMenuLinkItem, MegaMenuPanel } from "./NavMegaMenu"

const SERVICE_ACCENTS: Record<string, { accent: string; soft: string }> = {
  marketplace: { accent: '#0f172a', soft: 'rgba(15, 23, 42, 0.1)' },
  sourcing: { accent: '#0891B2', soft: 'rgba(8, 145, 178, 0.12)' },
  verification: { accent: '#059669', soft: 'rgba(5, 150, 105, 0.12)' },
  logistics: { accent: '#7C3AED', soft: 'rgba(124, 58, 237, 0.12)' },
  finance: { accent: '#B45309', soft: 'rgba(180, 83, 9, 0.12)' },
}

function ServiceNavIcon({ id }: { id: HomeService['icon'] }) {
  const stroke = {
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (id) {
    case 'marketplace':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path {...stroke} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      )
    case 'sourcing':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path {...stroke} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      )
    case 'verification':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path {...stroke} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'logistics':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path {...stroke} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      )
    case 'finance':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path {...stroke} d="M2.25 18.75a7.5 7.5 0 0015 0M2.25 18.75h15M2.25 18.75v-7.5a7.5 7.5 0 0115 0v7.5M12 6.75v3.75m0 0l2.25-2.25M12 10.5L9.75 8.25" />
        </svg>
      )
  }
}

type HomeService = (typeof HOME_SERVICES)[number]

type HeaderMainNavProps = {
  parentCategories: HttpTypes.StoreProductCategory[]
}

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4 opacity-60", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

export function HeaderMainNav({ parentCategories }: HeaderMainNavProps) {
  const [openMenu, setOpenMenu] = useState<"products" | "services" | "industries" | null>(null)
  const searchParams = useSearchParams()

  const currentSector = (searchParams.get("sector") ||
    Cookies.get(SECTOR_COOKIE) ||
    "all") as SectorId
  const catalogQuery = buildCatalogQuery(currentSector)
  const servicesQuery = buildCatalogQuery(currentSector, undefined, "service")

  return (
    <nav
      className="hidden lg:flex items-start gap-1 relative"
      aria-label="Main navigation"
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div
        className="relative shrink-0"
        onMouseEnter={() => setOpenMenu("products")}
      >
        <button
          type="button"
          className={cn(
            "tese-nav-link inline-flex items-center gap-1",
            openMenu === "products" && "tese-nav-link-active"
          )}
          aria-expanded={openMenu === "products"}
        >
          Products
          <ChevronDown className={openMenu === "products" ? "rotate-180" : ""} />
        </button>
        {openMenu === "products" && (
          <MegaMenuPanel
            eyebrow="Sustainable catalogue"
            title="Browse by material category"
            footerHref={`/categories${catalogQuery}`}
            footerLabel="View all products"
            onClose={() => setOpenMenu(null)}
          >
            <div className="tese-mega-menu-grid">
              {parentCategories.map((cat) => {
                const visual = getCategoryVisual(cat.handle || '')
                return (
                  <MegaMenuLinkItem
                    key={cat.id}
                    href={categoryHref(cat.handle || '', catalogQuery)}
                    title={cat.name || ''}
                    description={cat.description || undefined}
                    accent={visual.accent}
                    accentSoft={visual.accentSoft}
                    icon={visual.icon}
                    onClose={() => setOpenMenu(null)}
                  />
                )
              })}
            </div>
          </MegaMenuPanel>
        )}
      </div>

      <div
        className="relative shrink-0"
        onMouseEnter={() => setOpenMenu("services")}
      >
        <button
          type="button"
          className={cn(
            "tese-nav-link inline-flex items-center gap-1",
            openMenu === "services" && "tese-nav-link-active"
          )}
          aria-expanded={openMenu === "services"}
        >
          Services
          <ChevronDown className={openMenu === "services" ? "rotate-180" : ""} />
        </button>
        {openMenu === "services" && (
          <MegaMenuPanel
            eyebrow="Platform capabilities"
            title="Procurement services on tese.io"
            footerHref={`/categories${servicesQuery}`}
            footerLabel="View all services"
            onClose={() => setOpenMenu(null)}
          >
            <div className="tese-mega-menu-grid">
              {HOME_SERVICES.map((service) => {
                const colors = SERVICE_ACCENTS[service.id]
                return (
                  <MegaMenuLinkItem
                    key={service.id}
                    href={service.href}
                    title={service.title}
                    description={service.description}
                    accent={colors?.accent}
                    accentSoft={colors?.soft}
                    icon={<ServiceNavIcon id={service.icon} />}
                    onClose={() => setOpenMenu(null)}
                  />
                )
              })}
            </div>
          </MegaMenuPanel>
        )}
      </div>

      <div
        className="relative shrink-0"
        onMouseEnter={() => setOpenMenu("industries")}
      >
        <button
          type="button"
          className={cn(
            "tese-nav-link inline-flex items-center gap-1",
            openMenu === "industries" && "tese-nav-link-active"
          )}
          aria-expanded={openMenu === "industries"}
        >
          Industries
          <ChevronDown className={openMenu === "industries" ? "rotate-180" : ""} />
        </button>
        {openMenu === "industries" && (
          <MegaMenuPanel
            eyebrow="Sectors"
            title="Industries we serve"
            footerHref={`/categories${catalogQuery}`}
            footerLabel="Browse all sectors"
            onClose={() => setOpenMenu(null)}
            wide={false}
          >
            <div className="tese-mega-menu-list">
              {SECTORS.map((sector) => {
                if (sector.id === 'all') {
                  return (
                    <MegaMenuLinkItem
                      key={sector.id}
                      href={`/categories${catalogQuery}`}
                      title={sector.label}
                      description="All products and services across every sector"
                      icon={
                        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                          <path fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
                        </svg>
                      }
                      onClose={() => setOpenMenu(null)}
                    />
                  )
                }

                const visual = getSectorVisual(sector.id)
                return (
                  <MegaMenuLinkItem
                    key={sector.id}
                    href={`/categories${buildCatalogQuery(sector.id)}`}
                    title={sector.label}
                    description={`${sector.categoryHandles.length} categories · ${sector.shortLabel}`}
                    accent={visual.accent}
                    accentSoft={visual.accentSoft}
                    icon={visual.icon}
                    onClose={() => setOpenMenu(null)}
                  />
                )
              })}
            </div>
          </MegaMenuPanel>
        )}
      </div>

      <LocalizedClientLink href="/sourcing" className="tese-nav-link">
        AI Sourcing
      </LocalizedClientLink>

      <LocalizedClientLink href={`/categories${catalogQuery}`} className="tese-nav-link">
        Catalogue
      </LocalizedClientLink>
    </nav>
  )
}
