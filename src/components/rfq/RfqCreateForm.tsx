'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRfqRequest } from '@/lib/data/rfq'

const RFQ_TYPES = [
  { value: 'product', label: 'Product', description: 'Physical or digital products' },
  { value: 'service', label: 'Service', description: 'ESG consulting, audits, or other services' },
  { value: 'mixed', label: 'Mixed', description: 'Both products and services' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export function RfqCreateForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rfq_type: 'product',
    priority: 'medium',
    budget_min: '',
    budget_max: '',
    currency_code: 'USD',
    quantity: '',
    unit: '',
    deadline: '',
    requirements: '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const data: Record<string, unknown> = {
        title: formData.title,
        description: formData.description,
        rfq_type: formData.rfq_type,
        priority: formData.priority,
        currency_code: formData.currency_code,
      }

      if (formData.budget_min) data.budget_min = parseInt(formData.budget_min, 10) * 100
      if (formData.budget_max) data.budget_max = parseInt(formData.budget_max, 10) * 100
      if (formData.quantity) data.quantity = parseInt(formData.quantity, 10)
      if (formData.unit) data.unit = formData.unit
      if (formData.deadline) data.deadline = formData.deadline
      if (formData.requirements) data.requirements = formData.requirements

      const rfq = await createRfqRequest(data as Parameters<typeof createRfqRequest>[0])
      router.push(`/rfq/${rfq.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create RFQ. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-negative-secondary border border-negative-secondary rounded-sm">
          <p className="text-sm text-negative">{error}</p>
        </div>
      )}

      {/* RFQ Type */}
      <div>
        <label className="label-lg text-primary mb-3 block">What are you looking for?</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {RFQ_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, rfq_type: type.value }))}
              className={`text-left p-4 border rounded-sm transition-all ${
                formData.rfq_type === type.value
                  ? 'border-action bg-accent shadow-card'
                  : 'border-primary bg-card hover:border-action'
              }`}
            >
              <p className="label-md text-primary">{type.label}</p>
              <p className="text-sm text-secondary mt-0.5">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="label-md text-primary mb-1.5 block">
            Title <span className="text-negative">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., ESG Audit for Manufacturing Operations"
            className="w-full px-4 py-3 border border-primary rounded-xs bg-card text-primary text-sm placeholder:text-disabled focus:outline-none focus:border-action transition-colors"
          />
        </div>
        <div>
          <label htmlFor="description" className="label-md text-primary mb-1.5 block">
            Description <span className="text-negative">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what you need in detail. Include specifications, scope, timeline expectations, and any other relevant information."
            className="w-full px-4 py-3 border border-primary rounded-xs bg-card text-primary text-sm placeholder:text-disabled focus:outline-none focus:border-action transition-colors resize-y"
          />
        </div>
      </div>

      {/* Budget & Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="budget_min" className="label-md text-primary mb-1.5 block">
            Budget Min ($)
          </label>
          <input
            id="budget_min"
            name="budget_min"
            type="number"
            min="0"
            value={formData.budget_min}
            onChange={handleChange}
            placeholder="1,000"
            className="w-full px-4 py-3 border border-primary rounded-xs bg-card text-primary text-sm placeholder:text-disabled focus:outline-none focus:border-action transition-colors no-arrows-number-input"
          />
        </div>
        <div>
          <label htmlFor="budget_max" className="label-md text-primary mb-1.5 block">
            Budget Max ($)
          </label>
          <input
            id="budget_max"
            name="budget_max"
            type="number"
            min="0"
            value={formData.budget_max}
            onChange={handleChange}
            placeholder="10,000"
            className="w-full px-4 py-3 border border-primary rounded-xs bg-card text-primary text-sm placeholder:text-disabled focus:outline-none focus:border-action transition-colors no-arrows-number-input"
          />
        </div>
        <div>
          <label htmlFor="priority" className="label-md text-primary mb-1.5 block">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-primary rounded-xs bg-card text-primary text-sm focus:outline-none focus:border-action transition-colors"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="deadline" className="label-md text-primary mb-1.5 block">Deadline</label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-primary rounded-xs bg-card text-primary text-sm focus:outline-none focus:border-action transition-colors"
          />
        </div>
      </div>

      {/* Quantity (for products) */}
      {formData.rfq_type !== 'service' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="label-md text-primary mb-1.5 block">Quantity</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="100"
              className="w-full px-4 py-3 border border-primary rounded-xs bg-card text-primary text-sm placeholder:text-disabled focus:outline-none focus:border-action transition-colors no-arrows-number-input"
            />
          </div>
          <div>
            <label htmlFor="unit" className="label-md text-primary mb-1.5 block">Unit</label>
            <input
              id="unit"
              name="unit"
              type="text"
              value={formData.unit}
              onChange={handleChange}
              placeholder="e.g., pieces, kg, pallets"
              className="w-full px-4 py-3 border border-primary rounded-xs bg-card text-primary text-sm placeholder:text-disabled focus:outline-none focus:border-action transition-colors"
            />
          </div>
        </div>
      )}

      {/* Requirements */}
      <div>
        <label htmlFor="requirements" className="label-md text-primary mb-1.5 block">
          Additional Requirements
        </label>
        <textarea
          id="requirements"
          name="requirements"
          rows={3}
          value={formData.requirements}
          onChange={handleChange}
          placeholder="Certifications needed, compliance standards, geographic preferences, etc."
          className="w-full px-4 py-3 border border-primary rounded-xs bg-card text-primary text-sm placeholder:text-disabled focus:outline-none focus:border-action transition-colors resize-y"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-4 border-t border-primary">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-action hover:bg-action-hover disabled:bg-disabled text-action-on-primary font-semibold rounded-sm transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit RFQ'}
        </button>
        <a
          href="/rfq"
          className="px-6 py-3 text-sm font-medium text-secondary hover:text-primary transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
