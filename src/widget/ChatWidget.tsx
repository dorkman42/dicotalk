import React, { useState, useCallback } from 'react';
import { ChatProvider } from './context/ChatContext.js';
import { ChatContainer } from './components/ChatContainer.js';
import { LauncherButton } from './components/LauncherButton.js';
import type { ChatWidgetProps } from './types.js';

/**
 * Dicotalk 채팅 위젯
 *
 * @example
 * ```tsx
 * import { ChatWidget } from 'dicotalk/widget';
 * import 'dicotalk/widget/styles.css';
 *
 * function App() {
 *   return (
 *     <ChatWidget
 *       apiEndpoint="/api/chat"
 *       title="고객 상담"
 *       subtitle="24시간 운영"
 *       themeColor="#4ADE80"
 *     />
 *   );
 * }
 * ```
 */
export function ChatWidget({
  apiEndpoint,
  title = 'Dicotalk',
  subtitle,
  welcomeMessage,
  agentName = '상담사',
  agentAvatar,
  logo,
  themeColor = '#4ADE80',
  pollingInterval = 3000,
  placeholder,
  position = 'bottom-right',
  sessionId: initialSessionId,
  customStyles,
  launcher,
  onSessionCreate,
  onMessageSend,
  onMessageReceive,
  onToggle,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  }, [isOpen, onToggle]);

  const config = {
    apiEndpoint,
    title,
    subtitle,
    welcomeMessage,
    agentName,
    agentAvatar,
    logo,
    themeColor,
    pollingInterval,
    placeholder,
  };

  return (
    <ChatProvider
      config={config}
      initialSessionId={initialSessionId}
      onSessionCreate={onSessionCreate}
      onMessageSend={onMessageSend}
      onMessageReceive={onMessageReceive}
    >
      <div
        className={`dicotalk-widget dicotalk-${position}`}
        style={customStyles?.container}
      >
        {/* 채팅 컨테이너 */}
        {isOpen && <ChatContainer onClose={handleToggle} />}

        {/* 런처 버튼 */}
        {launcher ? (
          launcher({
            isOpen,
            toggle: handleToggle,
            unreadCount: 0,
          })
        ) : (
          <LauncherButton
            isOpen={isOpen}
            onClick={handleToggle}
            themeColor={themeColor}
            customStyles={customStyles?.launcher}
          />
        )}
      </div>
    </ChatProvider>
  );
}
