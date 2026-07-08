import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export function SourcingCTA() {
  return (
    <section className="tese-container py-16 lg:py-20">
      <div className="relative overflow-hidden rounded-3xl tese-ink-surface text-white p-8 lg:p-12">
        <div className="pointer-events-none absolute inset-0 tese-grain opacity-30" aria-hidden />
        <div className="relative max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.18em] text-tese-lime mb-3">
            AI Sourcing workspace
          </p>
          <h2 className="text-2xl lg:text-4xl font-semibold leading-tight">
            Need a certified or lower-carbon alternative? Describe it on tese.io — we&apos;ll search the web.
          </h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            Natural-language sourcing with certification checks, supplier
            verification, embodied carbon signals, and catalog matches — in one
            conversation.
          </p>
          <LocalizedClientLink
            href="/sourcing"
            className="inline-flex mt-8 tese-cta rounded-full px-6 py-3 text-sm font-semibold cursor-pointer"
          >
            Open sourcing workspace →
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}
