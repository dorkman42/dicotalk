import React, { useState, useCallback, useRef } from 'react';
import { useChatContext } from '../context/ChatContext.js';

/**
 * 메시지 입력창
 */
export function MessageInput() {
  const { sendMessage, isLoading, config } = useChatContext();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = value.trim();
      if (!trimmed || isLoading) return;

      setValue('');
      await sendMessage(trimmed);

      // 포커스 유지
      inputRef.current?.focus();
    },
    [value, isLoading, sendMessage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <form className="dicotalk-input-form" onSubmit={handleSubmit}>
      <div className="dicotalk-input-wrapper">
        <textarea
          ref={inputRef}
          className="dicotalk-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={config.placeholder || '메시지를 입력하세요...'}
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="dicotalk-send-button"
          disabled={!value.trim() || isLoading}
          style={{ backgroundColor: config.themeColor }}
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}
