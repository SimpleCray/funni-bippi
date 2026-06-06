'use client'

import { Sidebar } from '@/components/chat/Sidebar'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { ProfilePanel } from '@/components/chat/ProfilePanel'
import type { AccentColor, IcebreakerItem, Message, Stranger, Theme } from '@/types'

interface ChatScreenProps {
  stranger: Stranger | null
  messages: Message[]
  typing: boolean
  icebreakers: IcebreakerItem[]
  rightOpen: boolean
  nav: 'chat' | 'profile'
  setNav: (n: 'chat' | 'profile') => void
  accent: AccentColor
  setAccent: (a: AccentColor) => void
  theme: Theme
  toggleTheme: () => void
  openSettings: () => void
  onLogo: () => void
  onSend: (text: string) => void
  onTyping: (typing: boolean) => void
  onReact: (id: string, emoji: string) => void
  onNext: () => void
  onReport: () => void
  onTogglePanel: () => void
  onImageUpload?: (file: File) => void
}

export function ChatScreen({
  stranger, messages, typing, icebreakers, rightOpen,
  nav, setNav, accent, setAccent, theme, toggleTheme,
  openSettings, onLogo, onSend, onTyping, onReact,
  onNext, onReport, onTogglePanel, onImageUpload,
}: ChatScreenProps) {
  return (
    <div className="layout">
      <Sidebar
        nav={nav} setNav={setNav}
        accent={accent} setAccent={setAccent}
        theme={theme} toggleTheme={toggleTheme}
        onLogo={onLogo} openSettings={openSettings}
      />
      <ChatPanel
        stranger={stranger} messages={messages} typing={typing}
        nav={nav} setNav={setNav}
        onSend={onSend} onTyping={onTyping} onReact={onReact}
        onNext={onNext} onTogglePanel={onTogglePanel}
        onImageUpload={onImageUpload}
      />
      {stranger && (
        <ProfilePanel
          stranger={stranger} icebreakers={icebreakers}
          collapsed={!rightOpen}
          onNext={onNext} onReport={onReport} onUseIce={onSend}
        />
      )}
    </div>
  )
}
