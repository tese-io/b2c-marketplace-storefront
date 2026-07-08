import type { Enquiry } from '@/types/enquiry'

type OrderLike = {
  fulfillment_status?: string | null
}

type ReturnLike = {
  status?: string | null
}

export function countPendingOrders (orders: OrderLike[]): number {
  return orders.filter((order) => {
    const status = order.fulfillment_status
    return Boolean(status && status !== 'delivered')
  }).length
}

export function countActionableEnquiries (enquiries: Enquiry[]): number {
  return enquiries.filter((enquiry) => {
    if (enquiry.targets?.some((target) => target.status === 'quoted')) {
      return true
    }

    return ['draft', 'open', 'quoted'].includes(enquiry.status)
  }).length
}

export function countPendingReturns (returns: ReturnLike[]): number {
  return returns.filter((item) => {
    const status = item.status
    return Boolean(status && status !== 'sent')
  }).length
}
