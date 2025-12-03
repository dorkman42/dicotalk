import React from 'react';
import { useChatContext } from '../context/ChatContext.js';

/**
 * 홈 화면 (채널톡 스타일)
 */
export function HomeView() {
  const { config, startChat, isSessionLoading } = useChatContext();

  return (
    <div className="dicotalk-home">
      {/* 헤더 */}
      <div className="dicotalk-home-header">
        {config.logo && (
          <img
            src={config.logo}
            alt={config.title}
            className="dicotalk-home-logo"
          />
        )}
        <div className="dicotalk-home-info">
          <h2 className="dicotalk-home-title">{config.title || 'Dicotalk'}</h2>
          {config.subtitle && (
            <p className="dicotalk-home-subtitle">
              <span className="dicotalk-status-dot" />
              {config.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 환영 메시지 */}
      <div className="dicotalk-welcome">
        {config.agentAvatar && (
          <img
            src={config.agentAvatar}
            alt={config.agentName}
            className="dicotalk-agent-avatar"
          />
        )}
        <div className="dicotalk-welcome-bubble">
          <span className="dicotalk-agent-name">
            {config.agentName || '상담사'}
          </span>
          <p className="dicotalk-welcome-message">
            {config.welcomeMessage ||
              '방문해주셔서 감사합니다 :) 어떻게 도와드릴까요?'}
          </p>
        </div>
      </div>

      {/* 문의하기 버튼 */}
      <button
        className="dicotalk-start-button"
        onClick={startChat}
        disabled={isSessionLoading}
        style={{ backgroundColor: config.themeColor }}
      >
        {isSessionLoading ? '연결 중...' : '문의하기'}
        <SendIcon />
      </button>

      {/* 응답 시간 안내 */}
      <p className="dicotalk-response-time">
        <span className="dicotalk-status-dot" />몇 분 내 답변 받으실 수 있어요
      </p>
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ marginLeft: 8 }}
    >
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}
