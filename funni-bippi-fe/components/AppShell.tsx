'use client'

import { useTheme } from '@/hooks/useTheme'
import { useChatStore } from '@/store/chatStore'

export default function AppShell() {
  useTheme()
  const screen = useChatStore((s) => s.screen)

  return (
    <div className="app-root" style={{ height: '100dvh' }}>
      {screen === 'landing' && (
        <div className="landing">
          <div className="landing-hero">
            <p style={{ fontFamily: 'var(--font-display)', color: 'var(--text-soft)' }}>
              Phase 1 complete — screens coming in Phase 2
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
