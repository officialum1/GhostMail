// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextResponse } from 'next/server'
import { verifyDeveloperApiKey, paymentRequiredResponse } from '@/lib/apiAuth'
import { db } from '@/lib/db'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyDeveloperApiKey(req)
    if (!auth.isAuthorized) {
      return paymentRequiredResponse(auth.error)
    }

    const emailId = Number.parseInt(params.id, 10)
    if (!Number.isSafeInteger(emailId) || emailId <= 0) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 })
    }

    const email = await db.email.findFirst({
      where: { id: emailId, deletedAt: null },
      select: {
        id: true,
        toAddress: true,
        fromAddress: true,
        subject: true,
        bodyText: true,
        bodyHtml: true,
        receivedAt: true,
        isRead: true,
        rawHeaders: true,
      },
    })

    if (!email) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Mark as read automatically when opened
    if (!email.isRead) {
      await db.email.update({
        where: { id: emailId },
        data: { isRead: true },
      })
    }

    return NextResponse.json({
      success: true,
      message: email,
    })
  } catch (error) {
    console.error('API message details error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyDeveloperApiKey(req)
    if (!auth.isAuthorized) {
      return paymentRequiredResponse(auth.error)
    }

    const emailId = Number.parseInt(params.id, 10)
    if (!Number.isSafeInteger(emailId) || emailId <= 0) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 })
    }

    const updated = await db.email
      .update({
        where: { id: emailId },
        data: { deletedAt: new Date() },
      })
      .catch(() => null)

    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Message deleted' })
  } catch (error) {
    console.error('API message delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
