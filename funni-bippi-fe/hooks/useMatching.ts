'use client'

import { useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import socket from '@/lib/socket'
import { useChatStore } from '@/store/chatStore'
import { fetchSession } from '@/lib/api'

export function useMatching() {
  const { data: session, isError } = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 3,
  })

  useEffect(() => {
    if (!session) return
    const { setSessionId, setUserId } = useChatStore.getState()
    setSessionId(session.sessionId)
    setUserId(session.userId)
  }, [session])

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

  return {
    startMatch,
    cancelMatch,
    disconnect,
    isSessionReady: !!session,
    isSessionError: isError,
  }
}
