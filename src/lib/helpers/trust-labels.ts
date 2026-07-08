import type { TrustStage, TrustStageId } from '@/data/explorer-copy'
import { TRUST_STAGES } from '@/data/explorer-copy'
import { HttpTypes } from '@medusajs/types'
import type { SellerProps } from '@/types/seller'

export function getTrustStageById (id: TrustStageId): TrustStage {
  return TRUST_STAGES.find((s) => s.id === id) || TRUST_STAGES[0]
}

/**
 * seller.is_verified is the admin-granted "tese Verified" flag on the
 * marketplace backend (grantable only via the admin sellers API).
 */
export function getSellerTrustStage (
  seller?: (SellerProps & { is_verified?: boolean }) | null
): TrustStage {
  if (seller?.is_verified) {
    return getTrustStageById('verified_supplier')
  }
  return getTrustStageById('listed')
}

export function getProductTrustStage (product: HttpTypes.StoreProduct): TrustStage {
  const meta = (product.metadata || {}) as Record<string, unknown>
  if (meta.tese_verified === true || meta.verified_product === true) {
    return getTrustStageById('verified_product')
  }
  return getTrustStageById('listed')
}
