'use client';

import { useEffect, useRef } from 'react';
import socket from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';
import { fireConfetti } from '@/components/ui/Confetti';
import { SOCKET_EVENTS } from '@/lib/socketEvents';
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

    socket.on(
      SOCKET_EVENTS.MATCH_FOUND,
      ({ roomId, stranger }: { roomId: string; stranger: Stranger }) => {
        const { setRoomId, setStranger, setConnected, setScreen } = store();
        setRoomId(roomId);
        setStranger(stranger);
        setConnected(true);
        setScreen('chat');
        fireConfetti();
        toastRef.current('✨', 'You matched! Say hi 👋');
      },
    );

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, ({ message }: { message: Message }) => {
      store().addMessage({ ...message, from: 'them' });
    });

    socket.on(
      SOCKET_EVENTS.CHAT_IMAGE,
      ({ messageId, imageUrl, time }: { messageId: string; imageUrl: string; time: string }) => {
        store().addMessage({
          id: messageId,
          from: 'them',
          imageUrl,
          time: time ?? fmtTime(),
        });
      },
    );

    socket.on(SOCKET_EVENTS.CHAT_TYPING, ({ typing }: { typing: boolean }) => {
      store().setTyping(typing);
    });

    socket.on(
      SOCKET_EVENTS.CHAT_REACTION,
      ({ messageId, emoji }: { messageId: string; emoji: string | null }) => {
        store().setMessageReaction(messageId, emoji || undefined);
      },
    );

    socket.on(SOCKET_EVENTS.CHAT_STRANGER_LEFT, () => {
      store().setTyping(false);
      store().setConnected(false);
      store().addMessage({
        id: uuid(),
        from: 'them',
        text: '👋 Stranger has left the chat.',
        time: fmtTime(),
      });
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      store().setConnected(false);
    });

    socket.on(SOCKET_EVENTS.ERROR_NO_MATCH, ({ reason }: { reason: string }) => {
      toastRef.current('😔', reason ?? 'No match found. Try again!');
      store().setScreen('landing');
      store().resetChat();
    });

    socket.on(SOCKET_EVENTS.ERROR_SERVER, ({ message }: { event?: string; message: string }) => {
      toastRef.current('⚠️', message ?? 'Something went wrong. Try again.');
    });

    return () => {
      socket.removeAllListeners();
    };
  }, []);
}
