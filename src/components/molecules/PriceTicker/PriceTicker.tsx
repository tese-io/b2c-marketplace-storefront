"use client"

const QUOTES = [
  { symbol: "LME Copper", price: "€8,620", change: "+0.8%", up: true },
  { symbol: "Hot-Rolled Coil", price: "€620/t", change: "-1.2%", up: false },
  { symbol: "Aluminium (99.7%)", price: "€2,200/t", change: "+0.4%", up: true },
  { symbol: "rPET Flakes", price: "€980/t", change: "+2.1%", up: true },
  { symbol: "HDPE Resin", price: "€1,180/t", change: "-0.6%", up: false },
  { symbol: "Portland Cement", price: "€105/t", change: "+0.2%", up: true },
  { symbol: "Stainless 304", price: "€2,950/t", change: "-0.3%", up: false },
  { symbol: "Caustic Soda", price: "€450/t", change: "+1.0%", up: true },
]

export function PriceTicker() {
  const items = [...QUOTES, ...QUOTES]

  return (
    <div className="bg-tese-ink text-white overflow-hidden border-b border-white/10">
      <div className="tese-container flex items-center gap-4 py-2">
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.14em] text-tese-lime">
          Insights
        </span>
        <div className="overflow-hidden flex-1 mask-fade-x">
          <div className="tese-marquee gap-12">
            {items.map((q, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-[11px] tabular-nums">
                <span className="text-white/70">{q.symbol}</span>
                <span className="font-semibold">{q.price}</span>
                <span className={q.up ? "text-price-up" : "text-price-down"}>{q.change}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
