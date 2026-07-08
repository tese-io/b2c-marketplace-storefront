import { NextRequest, NextResponse } from 'next/server'

import { storefrontBffFetch } from '@/lib/storefront-bff'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { ok, status, json } = await storefrontBffFetch('/enquiries', {
    method: 'GET',
  })

  return NextResponse.json(json, { status: ok ? 200 : status })
}

export async function POST(req: NextRequest) {
  let body = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ status: false, msg: 'Invalid JSON' }, { status: 400 })
  }

  const { ok, status, json } = await storefrontBffFetch('/enquiries', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return NextResponse.json(json, { status: ok ? 201 : status })
}
