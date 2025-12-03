import React from 'react';
import { useChatContext } from '../context/ChatContext.js';
import { HomeView } from './HomeView.js';
import { ChatView } from './ChatView.js';

interface ChatContainerProps {
  onClose: () => void;
}

/**
 * 채팅 컨테이너 (뷰 전환)
 */
export function ChatContainer({ onClose }: ChatContainerProps) {
  const { currentView, config } = useChatContext();

  return (
    <div className="dicotalk-container">
      {/* 닫기 버튼 */}
      <button
        className="dicotalk-close-button"
        onClick={onClose}
        aria-label="닫기"
      >
        <CloseIcon />
      </button>

      {/* 뷰 렌더링 */}
      {currentView === 'home' && <HomeView />}
      {currentView === 'chat' && <ChatView />}

      {/* 하단 탭 (홈에서만 표시) */}
      {currentView === 'home' && <BottomTabs />}

      {/* 브랜딩 */}
      <div className="dicotalk-branding">
        <a
          href="https://github.com/your-username/dicotalk"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: config.themeColor }}
        >
          Powered by Dicotalk
        </a>
      </div>
    </div>
  );
}

function BottomTabs() {
  const { currentView, setCurrentView } = useChatContext();

  return (
    <div className="dicotalk-tabs">
      <button
        className={`dicotalk-tab ${currentView === 'home' ? 'active' : ''}`}
        onClick={() => setCurrentView('home')}
      >
        <HomeIcon />
        <span>홈</span>
      </button>
      <button
        className={`dicotalk-tab ${currentView === 'chat' ? 'active' : ''}`}
        onClick={() => setCurrentView('chat')}
      >
        <ChatIcon />
        <span>대화</span>
      </button>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  );
}
