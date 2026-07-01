'use client'

import { useSearchParams } from 'next/navigation'

const STEPS = [
  { id: 'address', label: 'Address' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
] as const

function stepIndex (step: string | null) {
  if (!step) return 0
  const idx = STEPS.findIndex(s => s.id === step)
  return idx >= 0 ? idx : 0
}

export function CheckoutProgress () {
  const searchParams = useSearchParams()
  const current = searchParams.get('step') || 'address'
  const activeIdx = stepIndex(current)

  return (
    <nav className="tese-checkout-progress" aria-label="Checkout progress">
      <ol className="tese-checkout-progress-list">
        {STEPS.map((step, idx) => {
          const isComplete = idx < activeIdx
          const isActive = step.id === current || (idx === 0 && !searchParams.get('step'))
          const state = isComplete ? 'complete' : isActive ? 'active' : 'upcoming'

          return (
            <li
              key={step.id}
              className={`tese-checkout-progress-item tese-checkout-progress-item--${state}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="tese-checkout-progress-dot" aria-hidden="true">
                {isComplete ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </span>
              <span className="tese-checkout-progress-label">{step.label}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
