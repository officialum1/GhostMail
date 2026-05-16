type StreamController = ReadableStreamDefaultController<Uint8Array>

const listeners = new Map<number, Set<StreamController>>()

export function subscribeToUserEmails(userId: number, controller: StreamController) {
  if (!listeners.has(userId)) {
    listeners.set(userId, new Set())
  }
  listeners.get(userId)!.add(controller)

  return () => {
    listeners.get(userId)?.delete(controller)
    if (listeners.get(userId)?.size === 0) {
      listeners.delete(userId)
    }
  }
}

export function notifyNewEmail(userId: number) {
  const payload = new TextEncoder().encode(
    `data: ${JSON.stringify({ type: 'new_email', userId })}\n\n`
  )

  for (const controller of listeners.get(userId) ?? []) {
    try {
      controller.enqueue(payload)
    } catch {
      listeners.get(userId)?.delete(controller)
    }
  }
}
