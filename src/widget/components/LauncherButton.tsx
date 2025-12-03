import React from 'react';
import type { CSSProperties } from 'react';

interface LauncherButtonProps {
  isOpen: boolean;
  onClick: () => void;
  themeColor?: string;
  customStyles?: CSSProperties;
}

/**
 * 플로팅 런처 버튼
 */
export function LauncherButton({
  isOpen,
  onClick,
  themeColor = '#4ADE80',
  customStyles,
}: LauncherButtonProps) {
  return (
    <button
      className="dicotalk-launcher"
      onClick={onClick}
      style={{
        backgroundColor: themeColor,
        ...customStyles,
      }}
      aria-label={isOpen ? '채팅 닫기' : '채팅 열기'}
    >
      {isOpen ? (
        <CloseIcon />
      ) : (
        <HeadsetIcon />
      )}
    </button>
  );
}

function HeadsetIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
