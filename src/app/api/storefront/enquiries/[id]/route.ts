import { NextRequest, NextResponse } from 'next/server'

import { storefrontBffFetch } from '@/lib/storefront-bff'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { ok, status, json } = await storefrontBffFetch(`/enquiries/${id}`, {
    method: 'GET',
  })

  return NextResponse.json(json, { status: ok ? 200 : status })
}
