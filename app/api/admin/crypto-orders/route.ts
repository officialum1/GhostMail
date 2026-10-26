// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import {
  getCryptoUpgradeRequests,
  approveCryptoUpgradeRequest,
  rejectCryptoUpgradeRequest,
} from '@/lib/cryptoPayments'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const requests = await getCryptoUpgradeRequests()
    return NextResponse.json(requests)
  } catch (error) {
    console.error('Failed to get crypto orders:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const body = await req.json()
    const { requestId } = body

    if (!requestId || typeof requestId !== 'string') {
      return NextResponse.json({ error: 'Invalid requestId' }, { status: 400 })
    }

    const result = await approveCryptoUpgradeRequest(requestId)
    return NextResponse.json({
      success: true,
      message: 'Order approved and API key issued',
      ...result,
    })
  } catch (error) {
    console.error('Failed to approve order:', error)
    return NextResponse.json({ error: 'Failed to approve order' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const body = await req.json()
    const { requestId } = body

    if (!requestId || typeof requestId !== 'string') {
      return NextResponse.json({ error: 'Invalid requestId' }, { status: 400 })
    }

    await rejectCryptoUpgradeRequest(requestId)
    return NextResponse.json({ success: true, message: 'Order rejected' })
  } catch (error) {
    console.error('Failed to reject order:', error)
    return NextResponse.json({ error: 'Failed to reject order' }, { status: 500 })
  }
}
