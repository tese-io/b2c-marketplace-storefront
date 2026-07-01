import type { SectorDefinition } from "@/data/sectors"
import { SITE_HERO_DEFAULT, SITE_HERO_EYEBROW } from "@/lib/constants/brand"

import { HeroSearch } from "./HeroSearch"

type B2BHeroProps = {
  locale: string
  sector: SectorDefinition
}

const PROOF = [
  {
    value: "12+",
    label: "Verified listings",
    icon: (
      <svg className="h-5 w-5 text-tese-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: "8",
    label: "Sustainable categories",
    icon: (
      <svg className="h-5 w-5 text-tese-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    value: "ESG",
    label: "Certification data",
    icon: (
      <svg className="h-5 w-5 text-tese-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    value: "60s",
    label: "Avg. AI search time",
    icon: (
      <svg className="h-5 w-5 text-tese-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
]

function accentPhrase(sector: SectorDefinition) {
  if (sector.id === "all") {
    return SITE_HERO_DEFAULT
  }
  const words = sector.headline.split(" ")
  if (words.length >= 3) {
    return {
      lead: words.slice(0, -2).join(" "),
      accent: words.slice(-2, -1).join(" "),
      tail: words.slice(-1).join(" "),
    }
  }
  return { lead: sector.headline, accent: "", tail: "" }
}

export function B2BHero({ locale, sector }: B2BHeroProps) {
  const { lead, accent, tail } = accentPhrase(sector)

  return (
    <section className="relative w-full overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute -left-20 top-16 h-48 w-48 rounded-full bg-tese-lime/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-8 h-56 w-56 rounded-full bg-tese-ice/15 blur-3xl"
        aria-hidden
      />

      <div className="tese-container relative py-14 lg:py-20 text-center">
        <p className="text-sm text-secondary font-medium">
          {sector.id === "all"
            ? SITE_HERO_EYEBROW
            : `Personalised for ${sector.label.toLowerCase()}`}
        </p>

        <h1 className="mt-3 mx-auto max-w-4xl text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.25] tracking-tight text-primary">
          {sector.id === "all" ? (
            <>
              <span className="block">
                The sustainability-focused marketplace
              </span>
              <span className="block mt-2 lg:mt-3">
                for{" "}
                <span className="text-tese-lime">{SITE_HERO_DEFAULT.accent}</span>
              </span>
            </>
          ) : (
            <>
              {lead}{" "}
              {accent && (
                <span className="text-tese-lime">{accent}</span>
              )}{" "}
              {tail}
            </>
          )}
        </h1>

        <p className="mt-4 mx-auto max-w-2xl text-base lg:text-lg text-secondary leading-relaxed">
          {sector.subheadline}
        </p>

        <div className="mt-10 flex justify-center">
          <HeroSearch locale={locale} />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {PROOF.map((s) => (
            <div key={s.label} className="flex items-center gap-2.5">
              {s.icon}
              <div className="text-left">
                <p className="text-base font-bold text-primary tabular-nums">{s.value}</p>
                <p className="text-[12px] text-secondary">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
