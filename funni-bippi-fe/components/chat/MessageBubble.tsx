'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Message, Stranger } from '@/types';
import { resolveImageUrl } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { QUICK_REACTS } from '@/lib/constants';
import type { Transition } from 'framer-motion';

interface MessageBubbleProps {
  message: Message;
  stranger: Stranger | null;
  onReact: (id: string, emoji: string) => void;
}

const spring: Transition = { type: 'spring', damping: 18, stiffness: 260, mass: 0.6 };

export function MessageBubble({ message: m, stranger, onReact }: MessageBubbleProps) {
  const mine = m.from === 'me';
  const [lightbox, setLightbox] = useState(false);
  const imageSrc = m.imageUrl ? resolveImageUrl(m.imageUrl) : null;

  return (
    <motion.div
      className={'row ' + (mine ? 'me' : 'them')}
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring}
      layout
    >
      {!mine && stranger && <Avatar stranger={stranger} size={32} />}
      <div className='stack'>
        <div className='react-bar'>
          {QUICK_REACTS.map((e) => (
            <button key={e} onClick={() => onReact(m.id, e)}>
              {e}
            </button>
          ))}
        </div>

        {imageSrc && (
          <div className='chat-image-block'>
            <button
              type='button'
              className='chat-image-btn'
              onClick={() => setLightbox(true)}
              aria-label='View image'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc} alt='' className='chat-image' />
            </button>
            {!m.text && m.reaction && <span className='reaction-chip'>{m.reaction}</span>}
          </div>
        )}

        {m.text && (
          <div className={'bubble ' + (mine ? 'me' : 'them')}>
            {m.text}
            {m.reaction && <span className='reaction-chip'>{m.reaction}</span>}
          </div>
        )}

        <div className='ts'>{m.time}</div>
      </div>

      {lightbox && imageSrc && <ImageLightbox src={imageSrc} onClose={() => setLightbox(false)} />}
    </motion.div>
  );
}
