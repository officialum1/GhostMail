import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { subscribeToUserEmails } from '@/lib/emailEvents'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = Number(session.user.id)
  if (!Number.isFinite(userId)) {
    return new Response('Unauthorized', { status: 401 })
  }

  let unsubscribe: (() => void) | null = null

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode(': connected\n\n'))

      unsubscribe = subscribeToUserEmails(userId, controller)

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch {
          clearInterval(heartbeat)
        }
      }, 25000)

      const cleanup = () => {
        clearInterval(heartbeat)
        unsubscribe?.()
      }

      ;(controller as { _cleanup?: () => void })._cleanup = cleanup
    },
    cancel() {
      unsubscribe?.()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
