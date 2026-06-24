'use client';

import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import socket from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';
import { fetchSession } from '@/lib/api';
import { SOCKET_EVENTS } from '@/lib/socketEvents';

export function useMatching() {
  const { data: session, isError } = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 3,
  });

  useEffect(() => {
    if (!session) return;
    const { setSessionId, setUserId } = useChatStore.getState();
    setSessionId(session.sessionId);
    setUserId(session.userId);
  }, [session]);

  const connect = useCallback((sessionId: string) => {
    if (socket.connected) return;
    socket.auth = { sessionId };
    socket.connect();
  }, []);

  const startMatch = useCallback(() => {
    const { sessionId } = useChatStore.getState();
    const { myGender, myInterest } = useSettingsStore.getState();
    if (!sessionId) return;
    connect(sessionId);
    socket.emit(SOCKET_EVENTS.USER_JOIN, { gender: myGender, interest: myInterest, sessionId });
  }, [connect]);

  const cancelMatch = useCallback(() => {
    socket.emit(SOCKET_EVENTS.USER_CANCEL);
  }, []);

  const disconnect = useCallback(() => {
    socket.emit(SOCKET_EVENTS.USER_CANCEL);
    socket.disconnect();
  }, []);

  return {
    startMatch,
    cancelMatch,
    disconnect,
    isSessionReady: !!session,
    isSessionError: isError,
  };
}
