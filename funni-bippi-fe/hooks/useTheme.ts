'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

export function useTheme() {
  const { theme, accent, setTheme, setAccent } = useSettingsStore()

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', theme)
    html.setAttribute('data-accent', accent)
  }, [theme, accent])

  return { theme, accent, setTheme, setAccent }
}
