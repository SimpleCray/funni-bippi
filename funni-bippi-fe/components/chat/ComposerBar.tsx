'use client'

import { useState, useRef, useEffect } from 'react'
import { IcSmile, IcClip, IcSend } from '@/components/ui/icons'
import { EMOJI } from '@/lib/icebreakers'

interface ComposerBarProps {
  onSend: (text: string) => void
  onTyping?: (typing: boolean) => void
  onImageUpload?: (file: File) => void
  isUploading?: boolean
  compact?: boolean
}

const ACCEPTED = 'image/jpeg,image/png,image/gif,image/webp'

export function ComposerBar({ onSend, onTyping, onImageUpload, isUploading, compact = false }: ComposerBarProps) {
  const [val, setVal] = useState('')
  const [focus, setFocus] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!emojiOpen) return
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!pickerRef.current?.contains(t) && !t.closest('.emoji-trigger')) {
        setEmojiOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [emojiOpen])

  function submit() {
    const t = val.trim()
    if (!t) return
    onSend(t)
    setVal('')
    onTyping?.(false)
    setEmojiOpen(false)
    inputRef.current?.focus()
  }

  function handleChange(v: string) {
    setVal(v)
    onTyping?.(v.length > 0)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && onImageUpload) onImageUpload(file)
    e.target.value = ''
  }

  return (
    <div style={{ position: 'relative' }}>
      {emojiOpen && (
        <div className="emoji-pop" ref={pickerRef}>
          {Object.entries(EMOJI).map(([cat, list]) => (
            <div key={cat}>
              <div className="cat">{cat}</div>
              <div className="emoji-grid scroll" style={{ maxHeight: cat === 'Smileys' ? 110 : 80 }}>
                {list.map((e, i) => (
                  <button key={i} onClick={() => {
                    setVal(v => v + e)
                    inputRef.current?.focus()
                  }}>{e}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className={'composer-bar' + (focus ? ' focus' : '')}>
        <button
          className="icon-btn round emoji-trigger"
          style={{ width: 38, height: 38 }}
          onClick={() => setEmojiOpen(v => !v)}
          title="Emoji"
        >
          <IcSmile size={21} />
        </button>
        {!compact && (
          <button
            className="icon-btn round"
            style={{ width: 38, height: 38 }}
            title={isUploading ? 'Uploading…' : 'Attach image'}
            disabled={isUploading}
            onClick={() => fileRef.current?.click()}
          >
            {isUploading ? <span style={{ fontSize: 14 }}>⏳</span> : <IcClip size={20} />}
          </button>
        )}
        <input
          ref={inputRef}
          value={val}
          placeholder="Say something nice…"
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onKeyDown={e => { if (e.key === 'Enter') submit() }}
        />
        <button
          className="send-btn pulse-hover"
          onClick={submit}
          disabled={!val.trim()}
          title="Send"
        >
          <IcSend size={20} />
        </button>
      </div>
    </div>
  )
}
