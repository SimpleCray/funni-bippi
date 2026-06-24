'use client';

import { useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import socket from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';
import { uploadImageFile } from '@/lib/api';
import { SOCKET_EVENTS } from '@/lib/socketEvents';
import { v4 as uuid } from 'uuid';

const fmtTime = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export function useChat() {
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = useRef(false);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const { sessionId } = useChatStore.getState();
      return uploadImageFile(file, sessionId);
    },
  });

  const sendMessage = useCallback((text: string) => {
    const { roomId, addMessage, isConnected } = useChatStore.getState();
    if (!roomId || !isConnected || !text.trim()) return;
    const messageId = uuid();
    addMessage({ id: messageId, from: 'me', text, time: fmtTime() });
    socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, { text, roomId, messageId });
  }, []);

  const sendImage = useCallback((imageUrl: string) => {
    const { roomId, addMessage, isConnected } = useChatStore.getState();
    if (!roomId || !isConnected) return;
    const messageId = uuid();
    addMessage({ id: messageId, from: 'me', imageUrl, time: fmtTime() });
    socket.emit(SOCKET_EVENTS.CHAT_IMAGE, { imageUrl, roomId, messageId });
  }, []);

  const sendReaction = useCallback((messageId: string, emoji: string) => {
    const { roomId, messages, reactToMessage } = useChatStore.getState();
    if (!roomId) return;
    const current = messages.find((m) => m.id === messageId)?.reaction;
    const next = current === emoji ? '' : emoji;
    reactToMessage(messageId, emoji);
    socket.emit(SOCKET_EVENTS.CHAT_REACTION, { messageId, roomId, emoji: next });
  }, []);

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        return await uploadMutation.mutateAsync(file);
      } catch {
        return null;
      }
    },
    [uploadMutation],
  );

  const emitTyping = useCallback((typing: boolean) => {
    const { roomId, isConnected } = useChatStore.getState();
    if (!roomId || !isConnected || typing === isTyping.current) return;
    isTyping.current = typing;
    socket.emit(SOCKET_EVENTS.CHAT_TYPING, { roomId, typing });
  }, []);

  const emitTypingDebounced = useCallback(
    (active: boolean) => {
      if (active) {
        emitTyping(true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => emitTyping(false), 2500);
      } else {
        if (typingTimer.current) clearTimeout(typingTimer.current);
        emitTyping(false);
      }
    },
    [emitTyping],
  );

  const nextStranger = useCallback(() => {
    const { roomId, sessionId } = useChatStore.getState();
    const { myGender, myInterest } = useSettingsStore.getState();
    if (roomId) socket.emit(SOCKET_EVENTS.CHAT_NEXT, { roomId });
    if (sessionId) {
      setTimeout(
        () =>
          socket.emit(SOCKET_EVENTS.USER_JOIN, {
            gender: myGender,
            interest: myInterest,
            sessionId,
          }),
        200,
      );
    }
  }, []);

  const report = useCallback(() => {
    const { roomId } = useChatStore.getState();
    if (roomId) socket.emit(SOCKET_EVENTS.CHAT_REPORT, { roomId, reason: 'user-report' });
  }, []);

  return {
    sendMessage,
    sendImage,
    sendReaction,
    uploadImage,
    emitTypingDebounced,
    nextStranger,
    report,
    isUploading: uploadMutation.isPending,
  };
}
