'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccentColor, Theme } from '@/types';

interface SettingsStore {
  theme: Theme;
  accent: AccentColor;
  notifyMatch: boolean;
  notifySound: boolean;
  showTyping: boolean;
  setTheme: (t: Theme) => void;
  setAccent: (a: AccentColor) => void;
  setNotifyMatch: (v: boolean) => void;
  setNotifySound: (v: boolean) => void;
  setShowTyping: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'light',
      accent: 'coral',
      notifyMatch: true,
      notifySound: true,
      showTyping: true,
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setNotifyMatch: (notifyMatch) => set({ notifyMatch }),
      setNotifySound: (notifySound) => set({ notifySound }),
      setShowTyping: (showTyping) => set({ showTyping }),
    }),
    { name: 'funni-bippi-settings' },
  ),
);
