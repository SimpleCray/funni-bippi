'use client';

import { useRef, useEffect } from 'react';
import type { Message, Stranger } from '@/types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ComposerBar } from './ComposerBar';
import { Avatar } from '@/components/ui/Avatar';
import { GenderBadge } from '@/components/ui/GenderBadge';
import { Mascot } from '@/components/brand/Mascot';
import { IcShuffle, IcPanel, IcChat } from '@/components/ui/icons';

const ME: Stranger = {
  name: 'You',
  grad: ['var(--accent)', 'var(--accent-2)'],
  glyph: 'Y',
  gender: 'any',
  country: '',
  interests: [],
};

interface ChatPanelProps {
  stranger: Stranger | null;
  messages: Message[];
  typing: boolean;
  nav: 'chat' | 'profile';
  setNav: (n: 'chat' | 'profile') => void;
  onSend: (text: string) => void;
  onTyping: (typing: boolean) => void;
  onReact: (id: string, emoji: string) => void;
  onNext: () => void;
  onTogglePanel: () => void;
  onImagesSend?: (files: File[]) => void;
  isUploading?: boolean;
}

export function ChatPanel({
  stranger,
  messages,
  typing,
  nav,
  setNav,
  onSend,
  onTyping,
  onReact,
  onNext,
  onTogglePanel,
  onImagesSend,
  isUploading,
}: ChatPanelProps) {
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  return (
    <div className='center'>
      <div className='chat-topbar'>
        {stranger && <Avatar stranger={stranger} size={46} online />}
        <div className='who'>
          <div className='name'>
            {stranger ? stranger.name : '—'}
            {stranger && <GenderBadge gender={stranger.gender} />}
          </div>
          <div className='sub'>
            <span className='conn-live'>
              <span className='blip' /> Connected
            </span>
            {' · anonymous chat'}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button className='btn btn-soft' onClick={onNext}>
          <IcShuffle size={16} /> Next stranger
        </button>
        <button className='icon-btn' onClick={onTogglePanel} title='Toggle profile panel'>
          <IcPanel size={21} />
        </button>
      </div>

      {nav === 'profile' ? (
        <div
          className='msgs scroll'
          style={{ alignItems: 'center', justifyContent: 'center', gap: 16 }}
        >
          <Mascot size={96} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>
            This is you 👋
          </div>
          <div className='panel-card' style={{ width: 320 }}>
            <div className='big-ava'>
              <Avatar stranger={ME} size={80} online />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
              Anonymous You
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 6 }}>
              You appear to strangers with a fun random name each chat. No photos, no real name —
              just vibes.
            </div>
          </div>
          <button className='btn btn-ghost' onClick={() => setNav('chat')}>
            <IcChat size={17} /> Back to chat
          </button>
        </div>
      ) : (
        <>
          <div className='msgs scroll' ref={msgsRef}>
            <div className='day-pill'>Today · you&apos;re now chatting 🎉</div>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} stranger={stranger} onReact={onReact} />
            ))}
            {typing && stranger && <TypingIndicator stranger={stranger} />}
          </div>
          <div className='composer'>
            <ComposerBar
              onSend={onSend}
              onTyping={onTyping}
              onImagesSend={onImagesSend}
              isUploading={isUploading}
            />
          </div>
        </>
      )}
    </div>
  );
}
