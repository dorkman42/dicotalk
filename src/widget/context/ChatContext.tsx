import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSession } from '../hooks/useSession.js';
import { useChat } from '../hooks/useChat.js';
import type {
  ChatContextValue,
  ChatView,
  WidgetConfig,
  Message,
} from '../types.js';

const ChatContext = createContext<ChatContextValue | null>(null);

interface ChatProviderProps {
  children: React.ReactNode;
  config: WidgetConfig;
  initialSessionId?: string;
  onSessionCreate?: (sessionId: string) => void;
  onMessageSend?: (message: Message) => void;
  onMessageReceive?: (message: Message) => void;
}

export function ChatProvider({
  children,
  config,
  initialSessionId,
  onSessionCreate,
  onMessageSend,
  onMessageReceive,
}: ChatProviderProps) {
  const [currentView, setCurrentView] = useState<ChatView>('home');

  // 세션 관리
  const {
    sessionId,
    isLoading: isSessionLoading,
    createSession,
  } = useSession({
    apiEndpoint: config.apiEndpoint,
    initialSessionId,
    onSessionCreate,
  });

  // 채팅 관리
  const {
    messages,
    isLoading,
    error,
    sendMessage: sendChatMessage,
  } = useChat({
    apiEndpoint: config.apiEndpoint,
    sessionId,
    pollingInterval: config.pollingInterval ?? 3000,
    onMessageReceive,
  });

  // 메시지 전송 (콜백 포함)
  const sendMessage = useCallback(
    async (content: string) => {
      await sendChatMessage(content);

      // 콜백 호출
      if (onMessageSend) {
        onMessageSend({
          id: `temp-${Date.now()}`,
          content,
          sender: 'user',
          timestamp: Date.now(),
        });
      }
    },
    [sendChatMessage, onMessageSend]
  );

  // 채팅 시작
  const startChat = useCallback(async () => {
    if (!sessionId) {
      await createSession();
    }
    setCurrentView('chat');
  }, [sessionId, createSession]);

  const value: ChatContextValue = {
    config,
    sessionId,
    isSessionLoading,
    messages,
    isLoading,
    error,
    currentView,
    setCurrentView,
    sendMessage,
    startChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
