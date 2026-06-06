'use client'

import type { Stranger } from '@/types'

interface AvatarProps {
  stranger: Stranger
  size?: number
  online?: boolean
  dotSize?: number
}

export function Avatar({ stranger, size = 40, online = false, dotSize }: AvatarProps) {
  const ds = dotSize ?? Math.max(9, size * 0.26)
  const grad = `linear-gradient(135deg, ${stranger.grad[0]}, ${stranger.grad[1]})`
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, background: grad, fontSize: size * 0.42 }}
    >
      <span className="glyph">{stranger.glyph}</span>
      {online && (
        <span
          className="status-dot"
          style={{ width: ds, height: ds, right: size * 0.02, bottom: size * 0.02 }}
        />
      )}
    </div>
  )
}
