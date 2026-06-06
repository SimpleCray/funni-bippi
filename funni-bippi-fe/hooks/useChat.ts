'use client'

import { useCallback, useRef } from 'react'
import socket from '@/lib/socket'
import { useChatStore } from '@/store/chatStore'
import { v4 as uuid } from 'uuid'

const BE = process.env.NEXT_PUBLIC_BE_URL ?? 'http://localhost:3001'
const fmtTime = () =>
  new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

export function useChat() {
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTyping = useRef(false)

  const sendMessage = useCallback((text: string) => {
    const { roomId, addMessage } = useChatStore.getState()
    if (!roomId || !text.trim()) return
    const msgId = uuid()
    addMessage({ id: msgId, from: 'me', text, time: fmtTime() })
    socket.emit('chat:message', { text, roomId })
  }, [])

  const sendImage = useCallback((imageUrl: string) => {
    const { roomId, addMessage } = useChatStore.getState()
    if (!roomId) return
    addMessage({ id: uuid(), from: 'me', imageUrl, time: fmtTime() })
    socket.emit('chat:image', { imageUrl, roomId })
  }, [])

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    const { sessionId } = useChatStore.getState()
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch(`${BE}/upload`, {
        method: 'POST',
        headers: sessionId ? { Authorization: sessionId } : {},
        body: form,
      })
      if (!res.ok) return null
      const { imageUrl } = await res.json() as { imageUrl: string }
      return `${BE}${imageUrl}`
    } catch {
      return null
    }
  }, [])

  const emitTyping = useCallback((typing: boolean) => {
    const { roomId } = useChatStore.getState()
    if (!roomId) return
    if (typing === isTyping.current) return
    isTyping.current = typing
    socket.emit('chat:typing', { roomId, typing })
  }, [])

  const emitTypingDebounced = useCallback((active: boolean) => {
    if (active) {
      emitTyping(true)
      if (typingTimer.current) clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => emitTyping(false), 2500)
    } else {
      if (typingTimer.current) clearTimeout(typingTimer.current)
      emitTyping(false)
    }
  }, [emitTyping])

  const nextStranger = useCallback(() => {
    const { roomId, filter, sessionId } = useChatStore.getState()
    if (roomId) socket.emit('chat:next', { roomId })
    if (sessionId) {
      setTimeout(() => {
        socket.emit('user:join', { gender: filter, sessionId })
      }, 200)
    }
  }, [])

  const report = useCallback(() => {
    const { roomId } = useChatStore.getState()
    if (roomId) socket.emit('chat:report', { roomId, reason: 'user-report' })
  }, [])

  return { sendMessage, sendImage, uploadImage, emitTypingDebounced, nextStranger, report }
}
