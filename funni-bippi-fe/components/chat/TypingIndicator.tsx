'use client'

import type { Stranger } from '@/types'
import { Avatar } from '@/components/ui/Avatar'

export function TypingIndicator({ stranger }: { stranger: Stranger }) {
  return (
    <div className="row them" style={{ marginTop: 8 }}>
      <Avatar stranger={stranger} size={32} />
      <div className="typing">
        <span /><span /><span />
      </div>
    </div>
  )
}
