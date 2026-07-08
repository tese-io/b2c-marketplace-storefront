import { NextResponse } from 'next/server'
import { proxyListSourcingThreads } from '@/lib/storefront-bff'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await proxyListSourcingThreads()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ threads: [] })
  }
}
