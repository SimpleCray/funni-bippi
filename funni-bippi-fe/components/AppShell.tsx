'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useChatStore } from '@/store/chatStore';
import { useSocket } from '@/hooks/useSocket';
import { useMatching } from '@/hooks/useMatching';
import { useChat } from '@/hooks/useChat';
import { useIsMobile } from '@/hooks/useIsMobile';
import { sampleIcebreakers } from '@/lib/icebreakers';
import { Toast } from '@/components/ui/Toast';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { Sidebar } from '@/components/chat/Sidebar';
import { MatchmakingScreen } from '@/components/screens/MatchmakingScreen';
import { LandingScreen } from '@/components/screens/LandingScreen';
import { ChatScreen } from '@/components/screens/ChatScreen';
import { MobileChatScreen } from '@/components/screens/MobileChatScreen';
import type { AccentColor, IcebreakerItem } from '@/types';

export default function AppShell() {
  const { theme, accent, setTheme, setAccent } = useTheme();
  const { screen, setScreen, stranger, messages, typing, setTyping, reactToMessage, resetChat } =
    useChatStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState<{ icon: string; text: string } | null>(null);
  const [rightOpen, setRightOpen] = useState(true);
  const [nav, setNav] = useState<'chat' | 'profile'>('chat');
  const [icebreakers, setIcebreakers] = useState<IcebreakerItem[]>(() => sampleIcebreakers());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMobile = useIsMobile();
  const { startMatch, cancelMatch, disconnect, isSessionReady, isSessionError } = useMatching();
  const {
    sendMessage,
    sendImage,
    uploadImage,
    emitTypingDebounced,
    nextStranger,
    report,
    isUploading,
  } = useChat();

  const flashToast = (icon: string, text: string) => {
    setToast({ icon, text });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  useSocket(flashToast);

  useEffect(() => {
    if (isSessionError) flashToast('⚠️', 'Cannot reach server. Is the BE running?');
  }, [isSessionError]);

  function handleStart() {
    setScreen('matching');
    setIcebreakers(sampleIcebreakers());
    setNav('chat');
    resetChat();
    startMatch();
  }

  function handleCancel() {
    cancelMatch();
    setTyping(false);
    setScreen('landing');
    resetChat();
  }

  function handleGoHome() {
    disconnect();
    setTyping(false);
    setScreen('landing');
    resetChat();
  }

  function handleNext() {
    setTyping(false);
    setScreen('matching');
    resetChat();
    setIcebreakers(sampleIcebreakers());
    nextStranger();
    setTimeout(() => setScreen('matching'), 0);
  }

  function handleReport() {
    flashToast('🚩', 'Thanks — reported. Finding someone new…');
    report();
    handleNext();
  }

  async function handleImageUpload(file: File) {
    const url = await uploadImage(file);
    if (url) sendImage(url);
    else flashToast('❌', 'Upload failed. Try again.');
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const sidebarProps = {
    nav,
    setNav,
    accent: accent as AccentColor,
    setAccent: setAccent as (a: AccentColor) => void,
    theme,
    toggleTheme,
    onLogo: handleGoHome,
    openSettings: () => setSettingsOpen(true),
  };

  const chatProps = {
    stranger,
    messages,
    typing,
    icebreakers,
    rightOpen,
    nav,
    setNav,
    accent: accent as AccentColor,
    setAccent: setAccent as (a: AccentColor) => void,
    theme,
    toggleTheme,
    openSettings: () => setSettingsOpen(true),
    onLogo: handleGoHome,
    onSend: sendMessage,
    onTyping: emitTypingDebounced,
    onReact: reactToMessage,
    onNext: handleNext,
    onReport: handleReport,
    onTogglePanel: () => setRightOpen((o) => !o),
    onImageUpload: handleImageUpload,
    isUploading,
  };

  return (
    <div className='app-root' style={{ height: '100dvh' }}>
      {screen === 'landing' && (
        <LandingScreen
          theme={theme}
          toggleTheme={toggleTheme}
          onStart={handleStart}
          openSettings={() => setSettingsOpen(true)}
          disabled={!isSessionReady}
        />
      )}

      {screen === 'matching' && (
        <div className='layout'>
          <Sidebar {...sidebarProps} />
          <div className='center'>
            <MatchmakingScreen onCancel={handleCancel} />
          </div>
        </div>
      )}

      {screen === 'chat' &&
        (isMobile ? <MobileChatScreen {...chatProps} /> : <ChatScreen {...chatProps} />)}

      {toast && <Toast icon={toast.icon} text={toast.text} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
