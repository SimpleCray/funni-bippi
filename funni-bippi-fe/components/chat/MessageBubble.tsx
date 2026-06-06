'use client'

import type { Message, Stranger } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { QUICK_REACTS } from '@/lib/constants'

interface MessageBubbleProps {
  message: Message
  stranger: Stranger | null
  onReact: (id: string, emoji: string) => void
}

export function MessageBubble({ message: m, stranger, onReact }: MessageBubbleProps) {
  const mine = m.from === 'me'
  return (
    <div className={'row ' + (mine ? 'me' : 'them')}>
      {!mine && stranger && <Avatar stranger={stranger} size={32} />}
      <div className="stack">
        <div className="react-bar">
          {QUICK_REACTS.map(e => (
            <button key={e} onClick={() => onReact(m.id, e)}>{e}</button>
          ))}
        </div>
        <div className={'bubble ' + (mine ? 'me' : 'them')}>
          {m.imageUrl && (
            <img
              src={m.imageUrl}
              alt=""
              style={{ maxWidth: 240, borderRadius: 12, display: 'block', marginBottom: m.text ? 6 : 0 }}
            />
          )}
          {m.text}
          {m.reaction && <span className="reaction-chip">{m.reaction}</span>}
        </div>
        <div className="ts">{m.time}</div>
      </div>
    </div>
  )
}
