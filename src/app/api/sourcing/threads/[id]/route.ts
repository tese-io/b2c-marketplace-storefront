import { NextRequest, NextResponse } from 'next/server'
import { proxyGetSourcingThread, proxyDeleteSourcingThread } from '@/lib/storefront-bff'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const data = await proxyGetSourcingThread(id)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ thread: null }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const data = await proxyDeleteSourcingThread(id)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ deleted: false })
  }
}
