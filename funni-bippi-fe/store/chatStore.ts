'use client'

import { create } from 'zustand'
import type { Filter, Message, Screen, Stranger } from '@/types'

interface ChatStore {
  screen: Screen
  stranger: Stranger | null
  messages: Message[]
  typing: boolean
  filter: Filter
  roomId: string | null
  sessionId: string | null
  setScreen: (s: Screen) => void
  setStranger: (s: Stranger | null) => void
  addMessage: (m: Message) => void
  setTyping: (t: boolean) => void
  setFilter: (f: Filter) => void
  setRoomId: (id: string | null) => void
  setSessionId: (id: string | null) => void
  resetChat: () => void
}

export const useChatStore = create<ChatStore>()((set) => ({
  screen: 'landing',
  stranger: null,
  messages: [],
  typing: false,
  filter: 'everyone',
  roomId: null,
  sessionId: null,
  setScreen: (screen) => set({ screen }),
  setStranger: (stranger) => set({ stranger }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setTyping: (typing) => set({ typing }),
  setFilter: (filter) => set({ filter }),
  setRoomId: (roomId) => set({ roomId }),
  setSessionId: (sessionId) => set({ sessionId }),
  resetChat: () => set({ stranger: null, messages: [], typing: false, roomId: null }),
}))
