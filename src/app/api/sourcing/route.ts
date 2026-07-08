import { NextRequest, NextResponse } from 'next/server'

import { proxySourcingSearch } from '@/lib/storefront-bff'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function POST(req: NextRequest) {
  let body: {
    query?: string
    chat_history?: { role: string; content: string }[]
    thread_id?: string
  } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const query = (body.query || '').trim()
  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  try {
    const data = await proxySourcingSearch({
      query,
      chat_history: body.chat_history,
      thread_id: body.thread_id,
    })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({
      status: 'error',
      answer: 'The sourcing assistant is temporarily unavailable.',
      suppliers: [],
      catalog_picks: [],
      follow_ups: [],
      meta: {},
    })
  }
}
