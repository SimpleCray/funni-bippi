'use client';

import { create } from 'zustand';
import type { Message, Screen, Stranger } from '@/types';

interface ChatStore {
  screen: Screen;
  stranger: Stranger | null;
  messages: Message[];
  typing: boolean;
  roomId: string | null;
  sessionId: string | null;
  userId: string | null;
  isConnected: boolean;
  setScreen: (s: Screen) => void;
  setStranger: (s: Stranger | null) => void;
  setConnected: (connected: boolean) => void;
  addMessage: (m: Message) => void;
  setTyping: (t: boolean) => void;
  setRoomId: (id: string | null) => void;
  setSessionId: (id: string | null) => void;
  setUserId: (id: string | null) => void;
  reactToMessage: (id: string, emoji: string) => void;
  setMessageReaction: (id: string, reaction: string | undefined) => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatStore>()((set) => ({
  screen: 'landing',
  stranger: null,
  messages: [],
  typing: false,
  roomId: null,
  sessionId: null,
  userId: null,
  isConnected: false,
  setScreen: (screen) => set({ screen }),
  setStranger: (stranger) => set({ stranger }),
  setConnected: (connected) => set({ isConnected: connected }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setTyping: (typing) => set({ typing }),
  setRoomId: (roomId) => set({ roomId }),
  setSessionId: (sessionId) => set({ sessionId }),
  setUserId: (userId) => set({ userId }),
  reactToMessage: (id, emoji) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, reaction: m.reaction === emoji ? undefined : emoji } : m,
      ),
    })),
  setMessageReaction: (id, reaction) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, reaction } : m)),
    })),
  resetChat: () =>
    set({ stranger: null, messages: [], typing: false, roomId: null, isConnected: false }),
}));
