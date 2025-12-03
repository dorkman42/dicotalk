import React from 'react';
import { useChatContext } from '../context/ChatContext.js';
import { MessageList } from './MessageList.js';
import { MessageInput } from './MessageInput.js';

/**
 * 채팅 화면
 */
export function ChatView() {
  const { config, setCurrentView } = useChatContext();

  return (
    <div className="dicotalk-chat">
      {/* 헤더 */}
      <div className="dicotalk-chat-header">
        <button
          className="dicotalk-back-button"
          onClick={() => setCurrentView('home')}
          aria-label="뒤로 가기"
        >
          <BackIcon />
        </button>
        <div className="dicotalk-chat-header-info">
          {config.logo && (
            <img
              src={config.logo}
              alt={config.title}
              className="dicotalk-chat-logo"
            />
          )}
          <div>
            <h3 className="dicotalk-chat-title">{config.title || 'Dicotalk'}</h3>
            <p className="dicotalk-chat-status">
              <span className="dicotalk-status-dot" />
              응답 대기중
            </p>
          </div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <MessageList />

      {/* 입력창 */}
      <MessageInput />
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
