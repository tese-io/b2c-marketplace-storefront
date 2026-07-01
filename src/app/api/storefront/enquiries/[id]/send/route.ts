import { NextRequest, NextResponse } from 'next/server'

import { storefrontBffFetch } from '@/lib/storefront-bff'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { ok, status, json } = await storefrontBffFetch(`/enquiries/${id}/send`, {
    method: 'POST',
    body: JSON.stringify({}),
  })

  return NextResponse.json(json, { status: ok ? status : status || 400 })
}
