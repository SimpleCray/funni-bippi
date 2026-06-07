'use client';

import { useRef, useEffect, useState } from 'react';
import type { AccentColor, IcebreakerItem, Message, Stranger, Theme } from '@/types';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ComposerBar } from '@/components/chat/ComposerBar';
import { Avatar } from '@/components/ui/Avatar';
import { GenderBadge } from '@/components/ui/GenderBadge';
import { IcShuffle, IcFlag, IcChat, IcUser, IcSettings } from '@/components/ui/icons';

interface MobileChatScreenProps {
  stranger: Stranger | null;
  messages: Message[];
  typing: boolean;
  icebreakers: IcebreakerItem[];
  onSend: (text: string) => void;
  onTyping: (typing: boolean) => void;
  onReact: (id: string, emoji: string) => void;
  onNext: () => void;
  onReport: () => void;
  onImageUpload?: (file: File) => void;
  openSettings: () => void;
  accent?: AccentColor;
  theme?: Theme;
}

export function MobileChatScreen({
  stranger,
  messages,
  typing,
  icebreakers,
  onSend,
  onTyping,
  onReact,
  onNext,
  onReport,
  onImageUpload,
  openSettings,
}: MobileChatScreenProps) {
  const msgsRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'chat' | 'profile'>('chat');

  useEffect(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  return (
    <div className='m-shell'>
      {/* Top bar */}
      <div className='m-topbar'>
        {stranger && <Avatar stranger={stranger} size={36} online />}
        <div style={{ flex: 1 }}>
          <div className='name'>
            {stranger?.name ?? '—'}
            {stranger && <GenderBadge gender={stranger.gender} />}
          </div>
          <div className='sub'>Anonymous chat</div>
        </div>
        <button className='icon-btn' onClick={onNext} title='Next'>
          <IcShuffle size={20} />
        </button>
        <button className='icon-btn' onClick={onReport} title='Report'>
          <IcFlag size={18} />
        </button>
      </div>

      {tab === 'chat' ? (
        <>
          {/* Messages */}
          <div className='m-msgs scroll' ref={msgsRef}>
            <div className='day-pill'>Today · you&apos;re now chatting 🎉</div>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} stranger={stranger} onReact={onReact} />
            ))}
            {typing && stranger && <TypingIndicator stranger={stranger} />}
          </div>

          {/* Horizontal icebreakers */}
          {icebreakers.length > 0 && messages.length === 0 && (
            <div
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                padding: '6px 12px',
                flexShrink: 0,
                scrollbarWidth: 'none',
              }}
            >
              {icebreakers.map((ib, i) => (
                <button
                  key={i}
                  onClick={() => onSend(ib.parts.join(''))}
                  style={{
                    flexShrink: 0,
                    fontSize: 12.5,
                    fontWeight: 600,
                    padding: '7px 13px',
                    borderRadius: 99,
                    background: 'var(--bg-sunken)',
                    color: 'var(--text-soft)',
                    border: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ib.e} {ib.parts[1]}
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <div className='m-composer'>
            <ComposerBar
              onSend={onSend}
              onTyping={onTyping}
              onImageUpload={onImageUpload}
              compact
            />
          </div>
        </>
      ) : (
        <div className='m-msgs scroll' style={{ alignItems: 'center', paddingTop: 32, gap: 16 }}>
          {stranger && (
            <div className='panel-card' style={{ width: '90%', maxWidth: 360 }}>
              <div className='big-ava'>
                <Avatar stranger={stranger} size={80} online />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
                {stranger.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                <GenderBadge gender={stranger.gender} />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 9, width: '90%', maxWidth: 360 }}>
            <button
              className='btn btn-soft'
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={onNext}
            >
              <IcShuffle size={17} /> Next
            </button>
            <button
              className='btn btn-danger'
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={onReport}
            >
              <IcFlag size={16} /> Report
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav className='m-nav'>
        <button className={tab === 'chat' ? 'on' : ''} onClick={() => setTab('chat')}>
          <IcChat size={22} /> Chat
        </button>
        <button className={tab === 'profile' ? 'on' : ''} onClick={() => setTab('profile')}>
          <IcUser size={22} /> Profile
        </button>
        <button onClick={openSettings}>
          <IcSettings size={22} /> Settings
        </button>
      </nav>
    </div>
  );
}
