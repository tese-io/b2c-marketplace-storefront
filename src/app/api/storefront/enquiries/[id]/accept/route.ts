import { NextRequest, NextResponse } from 'next/server'

import { storefrontBffFetch } from '@/lib/storefront-bff'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const { ok, status, json } = await storefrontBffFetch(`/enquiries/${id}/accept`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return NextResponse.json(json, { status: ok ? 200 : status })
}
