'use client'

import { useCallback, useRef } from 'react'
import socket from '@/lib/socket'
import { useChatStore } from '@/store/chatStore'

const BE = process.env.NEXT_PUBLIC_BE_URL ?? 'http://localhost:3001'

export function useMatching() {
  const initialised = useRef(false)

  const initSession = useCallback(async () => {
    if (initialised.current) return
    initialised.current = true
    try {
      const res = await fetch(`${BE}/session/init`, { method: 'POST' })
      const { sessionId, userId } = await res.json() as { sessionId: string; userId: string }
      useChatStore.getState().setSessionId(sessionId)
      useChatStore.getState().setUserId(userId)
    } catch {
      console.error('Session init failed — is the BE running?')
    }
  }, [])

  const connect = useCallback((sessionId: string) => {
    if (socket.connected) return
    socket.auth = { sessionId }
    socket.connect()
  }, [])

  const startMatch = useCallback(() => {
    const { sessionId, filter } = useChatStore.getState()
    if (!sessionId) return
    connect(sessionId)
    socket.emit('user:join', { gender: filter, sessionId })
  }, [connect])

  const cancelMatch = useCallback(() => {
    socket.emit('user:cancel')
  }, [])

  const disconnect = useCallback(() => {
    socket.emit('user:cancel')
    socket.disconnect()
  }, [])

  return { initSession, startMatch, cancelMatch, disconnect }
}
