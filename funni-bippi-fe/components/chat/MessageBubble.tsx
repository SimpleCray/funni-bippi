'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Message, Stranger } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
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
        <div className={'bubble ' + (mine ? 'me' : 'them')}>
          {m.imageUrl && (
            <Image
              src={m.imageUrl}
              alt=''
              width={240}
              height={240}
              style={{
                maxWidth: 240,
                borderRadius: 12,
                display: 'block',
                marginBottom: m.text ? 6 : 0,
              }}
            />
          )}
          {m.text}
          {m.reaction && <span className='reaction-chip'>{m.reaction}</span>}
        </div>
        <div className='ts'>{m.time}</div>
      </div>
    </motion.div>
  );
}
