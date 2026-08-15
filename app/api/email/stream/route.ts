import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { subscribeToUserEmails } from '@/lib/emailEvents'

export const dynamic = 'force-dynamic'

const HEARTBEAT_MS = 25_000
/** A stream holds an interval and a listener for its whole lifetime. */
const MAX_STREAMS_PER_USER = 5

const activeStreams = new Map<number, number>()

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = Number(session.user.id)
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return new Response('Unauthorized', { status: 401 })
  }

  if ((activeStreams.get(userId) ?? 0) >= MAX_STREAMS_PER_USER) {
    return new Response('Too many open streams', { status: 429 })
  }

  let unsubscribe: (() => void) | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null
  let closed = false

  // One cleanup path for every exit: cancel(), a failed enqueue, or an error.
  // Previously the heartbeat interval was stashed on the controller and never
  // invoked, so each disconnected client leaked a timer for the process's life.
  const cleanup = () => {
    if (closed) return
    closed = true
    if (heartbeat) clearInterval(heartbeat)
    unsubscribe?.()
    const remaining = (activeStreams.get(userId) ?? 1) - 1
    if (remaining <= 0) activeStreams.delete(userId)
    else activeStreams.set(userId, remaining)
  }

  activeStreams.set(userId, (activeStreams.get(userId) ?? 0) + 1)

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode(': connected\n\n'))

      unsubscribe = subscribeToUserEmails(userId, controller)

      heartbeat = setInterval(() => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch {
          // The client is gone; releasing here also drops the listener.
          cleanup()
        }
      }, HEARTBEAT_MS)
    },
    cancel() {
      cleanup()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Disable proxy buffering so events are not held back.
      'X-Accel-Buffering': 'no',
    },
  })
}
