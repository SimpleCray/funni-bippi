'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccentColor, Gender, Interest, Theme } from '@/types';

interface SettingsStore {
  theme: Theme;
  accent: AccentColor;
  notifyMatch: boolean;
  notifySound: boolean;
  showTyping: boolean;
  myGender: Gender;
  myInterest: Interest;
  setTheme: (t: Theme) => void;
  setAccent: (a: AccentColor) => void;
  setNotifyMatch: (v: boolean) => void;
  setNotifySound: (v: boolean) => void;
  setShowTyping: (v: boolean) => void;
  setMyGender: (g: Gender) => void;
  setMyInterest: (i: Interest) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'light',
      accent: 'coral',
      notifyMatch: true,
      notifySound: true,
      showTyping: true,
      myGender: 'male',
      myInterest: 'everyone',
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setNotifyMatch: (notifyMatch) => set({ notifyMatch }),
      setNotifySound: (notifySound) => set({ notifySound }),
      setShowTyping: (showTyping) => set({ showTyping }),
      setMyGender: (myGender) => set({ myGender }),
      setMyInterest: (myInterest) => set({ myInterest }),
    }),
    { name: 'funni-bippi-settings' },
  ),
);
