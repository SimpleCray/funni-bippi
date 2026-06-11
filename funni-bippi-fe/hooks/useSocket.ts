'use client';

import { useEffect, useRef } from 'react';
import socket from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';
import { fireConfetti } from '@/components/ui/Confetti';
import { v4 as uuid } from 'uuid';
import type { Stranger, Message } from '@/types';

const fmtTime = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export function useSocket(onToast: (icon: string, text: string) => void) {
  const toastRef = useRef(onToast);

  useEffect(() => {
    toastRef.current = onToast;
  }, [onToast]);

  useEffect(() => {
    const store = useChatStore.getState;

    socket.on('match:found', ({ roomId, stranger }: { roomId: string; stranger: Stranger }) => {
      const { setRoomId, setStranger, setConnected, setScreen } = store();
      setRoomId(roomId);
      setStranger(stranger);
      setConnected(true);
      setScreen('chat');
      fireConfetti();
      toastRef.current('✨', 'You matched! Say hi 👋');
    });

    socket.on('chat:message', ({ message }: { message: Message }) => {
      store().addMessage({ ...message, from: 'them' });
    });

    socket.on(
      'chat:image',
      ({ messageId, imageUrl, time }: { messageId: string; imageUrl: string; time: string }) => {
        store().addMessage({
          id: messageId,
          from: 'them',
          imageUrl,
          time: time ?? fmtTime(),
        });
      },
    );

    socket.on('chat:typing', ({ typing }: { typing: boolean }) => {
      store().setTyping(typing);
    });

    socket.on(
      'chat:reaction',
      ({ messageId, emoji }: { messageId: string; emoji: string | null }) => {
        store().setMessageReaction(messageId, emoji || undefined);
      },
    );

    socket.on('chat:stranger_left', () => {
      store().setTyping(false);
      store().setConnected(false);
      store().addMessage({
        id: uuid(),
        from: 'them',
        text: '👋 Stranger has left the chat.',
        time: fmtTime(),
      });
    });

    socket.on('disconnect', () => {
      store().setConnected(false);
    });

    socket.on('error:no_match', ({ reason }: { reason: string }) => {
      toastRef.current('😔', reason ?? 'No match found. Try again!');
      store().setScreen('landing');
      store().resetChat();
    });

    return () => {
      socket.removeAllListeners();
    };
  }, []);
}
