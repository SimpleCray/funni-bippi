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
import { MyProfileFields } from './MyProfileFields';
import { useSettingsStore } from '@/store/settingsStore';

interface ChatPanelProps {
  stranger: Stranger | null;
  isConnected: boolean;
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
  isConnected,
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
  const { myGender, myInterest } = useSettingsStore();
  const me: Stranger = {
    name: 'You',
    grad: ['var(--accent)', 'var(--accent-2)'],
    glyph: 'Y',
    gender: myGender,
    interest: myInterest,
    country: '',
  };

  useEffect(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  return (
    <div className='center'>
      <div className='chat-topbar'>
        {stranger && <Avatar stranger={stranger} size={46} />}
        <div className='who'>
          <div className='name'>
            {stranger ? stranger.name : '—'}
            {stranger && <GenderBadge gender={stranger.gender} />}
          </div>
          <div className='sub'>
            <span className={'conn-live' + (isConnected ? '' : ' disconnected')}>
              <span className='blip' /> {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {' · anonymous chat'}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button className='btn btn-soft' onClick={onNext}>
          <IcShuffle size={16} /> Next
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
          <div className='panel-card' style={{ width: '90%', maxWidth: 360 }}>
            <div className='big-ava'>
              <Avatar stranger={me} size={80} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
              Anonymous
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
              <GenderBadge gender={myGender} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 16 }}>
              You appear to strangers with a fun random name each chat. No photos, no real name —
              just vibes.
            </div>
            <MyProfileFields />
          </div>
          <button className='btn btn-ghost' onClick={() => setNav('chat')}>
            <IcChat size={17} /> Back to chat
          </button>
        </div>
      ) : (
        <>
          <div className='msgs scroll' ref={msgsRef}>
            <div className='day-pill'>Say hello to your new friend 🎉</div>
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
              disabled={!isConnected}
              stranger={stranger}
            />
          </div>
        </>
      )}
    </div>
  );
}
