'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { IcSmile, IcClip, IcSend } from '@/components/ui/icons';
import { EMOJI } from '@/lib/icebreakers';
import { normalizeImageFile } from '@/lib/imageFile';

import type { Stranger } from '@/types';

interface ComposerBarProps {
  onSend: (text: string) => void;
  onTyping?: (typing: boolean) => void;
  onImagesSend?: (files: File[]) => void;
  isUploading?: boolean;
  compact?: boolean;
  disabled?: boolean;
  stranger?: Stranger | null;
}

const MAX_IMAGES = 5;

type PendingImage = { id: string; file: File; preview: string };

export function ComposerBar({
  onSend,
  onTyping,
  onImagesSend,
  isUploading,
  compact = false,
  disabled = false,
  stranger,
}: ComposerBarProps) {
  const [val, setVal] = useState('');
  const [focus, setFocus] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pending, setPending] = useState<PendingImage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef(pending);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    if (!emojiOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!pickerRef.current?.contains(t) && !t.closest('.emoji-trigger')) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [emojiOpen]);

  useEffect(() => {
    return () => {
      pendingRef.current.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, []);

  const addImage = useCallback(async (raw: File) => {
    const file = await normalizeImageFile(raw);
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPending((prev) => {
      if (prev.length >= MAX_IMAGES) {
        URL.revokeObjectURL(preview);
        return prev;
      }
      return [...prev, { id: crypto.randomUUID(), file, preview }];
    });
  }, []);

  function removeImage(id: string) {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  function clearAll() {
    setPending((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.preview));
      return [];
    });
  }

  function submit() {
    if (disabled) return;
    const t = val.trim();
    const files = pending.map((p) => p.file);
    if (!t && files.length === 0) return;
    if (t) {
      onSend(t);
      setVal('');
      onTyping?.(false);
    }
    if (files.length > 0 && onImagesSend) {
      onImagesSend(files);
      clearAll();
    }
    setEmojiOpen(false);
    inputRef.current?.focus();
  }

  function handleChange(v: string) {
    if (disabled) return;
    setVal(v);
    onTyping?.(v.length > 0);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files) {
      for (const file of files) addImage(file);
    }
    e.target.value = '';
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) addImage(file);
        break;
      }
    }
  }

  const canSend = (val.trim().length > 0 || pending.length > 0) && !isUploading;

  return (
    <div style={{ position: 'relative', pointerEvents: disabled ? 'none' : undefined }}>
      {emojiOpen && (
        <div className='emoji-pop' ref={pickerRef}>
          {Object.entries(EMOJI).map(([cat, list]) => (
            <div key={cat}>
              <div className='cat'>{cat}</div>
              <div
                className='emoji-grid scroll'
                style={{ maxHeight: cat === 'Smileys' ? 110 : 80 }}
              >
                {list.map((e, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setVal((v) => v + e);
                      inputRef.current?.focus();
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type='file'
        accept='image/jpeg,image/png,image/gif,image/webp'
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className={'composer-bar' + (focus ? ' focus' : '')}>
        <button
          className='icon-btn round emoji-trigger'
          style={{ width: 38, height: 38 }}
          onClick={() => setEmojiOpen((v) => !v)}
          title={disabled ? `${stranger?.name || 'Stranger'} left the chat` : 'Emoji'}
          disabled={disabled}
        >
          <IcSmile size={21} />
        </button>
        {!compact && (
          <button
            className='icon-btn round'
            style={{ width: 38, height: 38 }}
            title={
              disabled ? 'Stranger left the chat' : isUploading ? 'Uploading…' : 'Attach image'
            }
            disabled={disabled || isUploading || pending.length >= MAX_IMAGES}
            onClick={() => fileRef.current?.click()}
          >
            {isUploading ? <span style={{ fontSize: 14 }}>⏳</span> : <IcClip size={20} />}
          </button>
        )}
        <input
          ref={inputRef}
          value={val}
          placeholder={
            disabled ? `${stranger?.name || 'Stranger'} has left the chat.` : 'Say something nice…'
          }
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onPaste={handlePaste}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
        <button
          className='send-btn pulse-hover'
          onClick={submit}
          disabled={disabled || !canSend}
          title={disabled ? `${stranger?.name || 'Stranger'} left the chat` : 'Send'}
        >
          <IcSend size={20} />
        </button>
      </div>

      {pending.length > 0 && (
        <div className='attachment-strip'>
          <div className='attachment-header'>
            <span>
              {pending.length} image{pending.length > 1 ? 's' : ''}
            </span>
            <button type='button' onClick={clearAll}>
              Clear all
            </button>
          </div>
          <div className='attachment-thumbs'>
            {pending.map((p) => (
              <div key={p.id} className='attachment-thumb'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt='' />
                <button
                  type='button'
                  className='attachment-remove'
                  onClick={() => removeImage(p.id)}
                  title='Remove'
                >
                  ×
                </button>
              </div>
            ))}
            {pending.length < MAX_IMAGES && (
              <button
                type='button'
                className='attachment-add'
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
                title='Add image'
              >
                +
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
