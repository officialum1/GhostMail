// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextResponse } from 'next/server'
import { getCryptoWalletConfig, submitCryptoUpgradeRequest } from '@/lib/cryptoPayments'

export async function GET() {
  try {
    const config = await getCryptoWalletConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error('Failed to get crypto config:', error)
    return NextResponse.json({ error: 'Failed to load payment options' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userEmail, network, txId } = body

    if (!userEmail || typeof userEmail !== 'string' || !userEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 })
    }

    if (!['USDT_TRC20', 'USDT_BEP20', 'BINANCE_PAY'].includes(network)) {
      return NextResponse.json({ error: 'Invalid crypto network selected' }, { status: 400 })
    }

    if (!txId || typeof txId !== 'string' || txId.trim().length < 8) {
      return NextResponse.json(
        { error: 'Valid Transaction Hash (TxID) or Binance Pay Order ID is required' },
        { status: 400 }
      )
    }

    const request = await submitCryptoUpgradeRequest({
      userEmail,
      network,
      txId,
    })

    return NextResponse.json({
      success: true,
      message: 'Payment verification submitted. Your account will be upgraded upon on-chain confirmation.',
      request,
    })
  } catch (error) {
    console.error('Failed to submit crypto payment:', error)
    return NextResponse.json({ error: 'Failed to submit payment verification' }, { status: 500 })
  }
}
