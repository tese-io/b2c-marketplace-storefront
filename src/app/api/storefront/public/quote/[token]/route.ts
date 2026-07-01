import { NextRequest, NextResponse } from 'next/server'

const TESE_BACKEND_URL = (
  process.env.TESE_BACKEND_URL ||
  process.env.NEXT_PUBLIC_TESE_API_URL ||
  'http://localhost:8000'
).replace(/\/$/, '')

async function publicQuoteFetch(token: string, init: RequestInit = {}) {
  const res = await fetch(
    `${TESE_BACKEND_URL}/api/v3/storefront/public/quote/${encodeURIComponent(token)}`,
    {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers as Record<string, string> | undefined),
      },
      cache: 'no-store',
    }
  )
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const { ok, status, json } = await publicQuoteFetch(token)
  return NextResponse.json(json, { status: ok ? status : status || 404 })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const body = await req.json().catch(() => ({}))
  const { ok, status, json } = await publicQuoteFetch(token, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return NextResponse.json(json, { status: ok ? status : status || 400 })
}
