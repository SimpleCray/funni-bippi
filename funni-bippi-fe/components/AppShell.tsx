'use client'

import { useState, useRef } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { useChatStore } from '@/store/chatStore'
import { makeStranger } from '@/lib/nameGenerator'
import { pickOpener, autoReply, sampleIcebreakers } from '@/lib/icebreakers'
import { fireConfetti } from '@/components/ui/Confetti'
import { Toast } from '@/components/ui/Toast'
import { SettingsModal } from '@/components/ui/SettingsModal'
import { Sidebar } from '@/components/chat/Sidebar'
import { MatchmakingScreen } from '@/components/screens/MatchmakingScreen'
import { LandingScreen } from '@/components/screens/LandingScreen'
import { ChatScreen } from '@/components/screens/ChatScreen'
import type { AccentColor, IcebreakerItem, Stranger } from '@/types'
import { v4 as uuid } from 'uuid'

const fmtTime = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

export default function AppShell() {
  const { theme, accent, setTheme, setAccent } = useTheme()
  const {
    screen, setScreen, stranger, setStranger,
    messages, typing, filter, addMessage, setTyping, reactToMessage, resetChat,
  } = useChatStore()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toast, setToast] = useState<{ icon: string; text: string } | null>(null)
  const [rightOpen, setRightOpen] = useState(true)
  const [nav, setNav] = useState<'chat' | 'profile'>('chat')
  const [icebreakers, setIcebreakers] = useState<IcebreakerItem[]>(() => sampleIcebreakers())

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const convId = useRef(0)

  function after(ms: number, fn: () => void) {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }
  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  function flashToast(icon: string, text: string, ms = 2600) {
    setToast({ icon, text })
    after(ms, () => setToast(null))
  }

  function strangerSpeaks(s: Stranger, text: string, id: number) {
    if (convId.current !== id) return
    setTyping(true)
    after(900 + Math.random() * 900, () => {
      if (convId.current !== id) return
      setTyping(false)
      addMessage({ id: uuid(), from: 'them', text, time: fmtTime() })
    })
  }

  function beginConversation(s: Stranger) {
    const id = ++convId.current
    resetChat()
    setStranger(s)
    setIcebreakers(sampleIcebreakers())
    after(700, () => strangerSpeaks(s, pickOpener(), id))
  }

  function startMatch() {
    setScreen('matching')
    clearTimers()
    after(2600, () => {
      const s = makeStranger(filter)
      setScreen('chat')
      setNav('chat')
      beginConversation(s)
      flashToast('✨', 'You matched! Say hi 👋')
      fireConfetti()
    })
  }

  function nextStranger() {
    clearTimers()
    setTyping(false)
    setScreen('matching')
    after(1600, () => {
      const s = makeStranger(filter)
      setScreen('chat')
      beginConversation(s)
      flashToast('🔀', 'New friend incoming!')
    })
  }

  function report() {
    flashToast('🚩', 'Thanks — reported. Finding someone new…')
    nextStranger()
  }

  function send(text: string) {
    const id = convId.current
    addMessage({ id: uuid(), from: 'me', text, time: fmtTime() })
    if (stranger) {
      after(550, () => strangerSpeaks(stranger, autoReply(text), id))
    }
  }

  function goHome() {
    clearTimers()
    setTyping(false)
    setScreen('landing')
    resetChat()
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const sidebarProps = {
    nav, setNav,
    accent: accent as AccentColor,
    setAccent: setAccent as (a: AccentColor) => void,
    theme,
    toggleTheme,
    onLogo: goHome,
    openSettings: () => setSettingsOpen(true),
  }

  return (
    <div className="app-root" style={{ height: '100dvh' }}>
      {screen === 'landing' && (
        <LandingScreen
          theme={theme}
          toggleTheme={toggleTheme}
          accent={accent as AccentColor}
          setAccent={setAccent as (a: AccentColor) => void}
          onStart={startMatch}
          openSettings={() => setSettingsOpen(true)}
        />
      )}

      {screen === 'matching' && (
        <div className="layout">
          <Sidebar {...sidebarProps} />
          <div className="center">
            <MatchmakingScreen onCancel={goHome} />
          </div>
        </div>
      )}

      {screen === 'chat' && (
        <ChatScreen
          stranger={stranger}
          messages={messages}
          typing={typing}
          icebreakers={icebreakers}
          rightOpen={rightOpen}
          nav={nav}
          setNav={setNav}
          accent={accent as AccentColor}
          setAccent={setAccent as (a: AccentColor) => void}
          theme={theme}
          toggleTheme={toggleTheme}
          openSettings={() => setSettingsOpen(true)}
          onLogo={goHome}
          onSend={send}
          onTyping={setTyping}
          onReact={reactToMessage}
          onNext={nextStranger}
          onReport={report}
          onTogglePanel={() => setRightOpen(o => !o)}
        />
      )}

      {toast && <Toast icon={toast.icon} text={toast.text} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
