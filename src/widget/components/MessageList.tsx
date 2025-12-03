import React, { useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext.js';
import type { Message } from '../types.js';

/**
 * 메시지 목록
 */
export function MessageList() {
  const { messages, config } = useChatContext();
  const listRef = useRef<HTMLDivElement>(null);

  // 새 메시지 시 스크롤
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="dicotalk-messages" ref={listRef}>
      {messages.length === 0 ? (
        <div className="dicotalk-messages-empty">
          <ChatBubbleIcon />
          <p>대화를 시작해보세요</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            agentName={config.agentName}
            agentAvatar={config.agentAvatar}
          />
        ))
      )}
    </div>
  );
}

interface MessageItemProps {
  message: Message;
  agentName?: string;
  agentAvatar?: string;
}

function MessageItem({ message, agentName, agentAvatar }: MessageItemProps) {
  const isAgent = message.sender === 'agent';
  const time = formatTime(message.timestamp);

  return (
    <div
      className={`dicotalk-message ${isAgent ? 'dicotalk-message-agent' : 'dicotalk-message-user'}`}
    >
      {isAgent && (
        <div className="dicotalk-message-avatar">
          {message.agentAvatar || agentAvatar ? (
            <img src={message.agentAvatar || agentAvatar} alt={agentName} />
          ) : (
            <DefaultAvatar />
          )}
        </div>
      )}
      <div className="dicotalk-message-content">
        {isAgent && (
          <span className="dicotalk-message-sender">
            {message.agentName || agentName || '상담사'}
          </span>
        )}
        <div className="dicotalk-message-bubble">
          <p>{message.content}</p>
        </div>
        <span className="dicotalk-message-time">{time}</span>
      </div>
    </div>
  );
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? '오후' : '오전';
  const hour12 = hours % 12 || 12;
  return `${ampm} ${hour12}:${minutes}`;
}

function ChatBubbleIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ccc"
      strokeWidth="1.5"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <circle cx="12" cy="12" r="1" fill="#ccc" />
      <circle cx="8" cy="12" r="1" fill="#ccc" />
      <circle cx="16" cy="12" r="1" fill="#ccc" />
    </svg>
  );
}

function DefaultAvatar() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="#4ADE80">
      <circle cx="16" cy="16" r="16" fill="#E8F5E9" />
      <circle cx="16" cy="14" r="6" fill="#4ADE80" />
      <path
        d="M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10"
        fill="#4ADE80"
      />
    </svg>
  );
}
