import type { CSSProperties, ReactNode } from 'react';
import type { Message } from '../shared/types.js';

/**
 * 위젯 설정
 */
export interface WidgetConfig {
  /** API 엔드포인트 URL */
  apiEndpoint: string;

  /** 회사/서비스 이름 */
  title?: string;

  /** 부제목 (예: "24시간 운영해요") */
  subtitle?: string;

  /** 환영 메시지 */
  welcomeMessage?: string;

  /** 상담사 이름 */
  agentName?: string;

  /** 상담사 아바타 URL */
  agentAvatar?: string;

  /** 로고 URL */
  logo?: string;

  /** 테마 색상 */
  themeColor?: string;

  /** 폴링 간격 (ms) */
  pollingInterval?: number;

  /** 입력 placeholder */
  placeholder?: string;
}

/**
 * ChatWidget 컴포넌트 Props
 */
export interface ChatWidgetProps extends WidgetConfig {
  /** 위젯 위치 */
  position?: 'bottom-right' | 'bottom-left';

  /** 기존 세션 ID */
  sessionId?: string;

  /** 커스텀 스타일 */
  customStyles?: CustomStyles;

  /** 커스텀 런처 버튼 */
  launcher?: (props: LauncherRenderProps) => ReactNode;

  /** 세션 생성 콜백 */
  onSessionCreate?: (sessionId: string) => void;

  /** 메시지 전송 콜백 */
  onMessageSend?: (message: Message) => void;

  /** 메시지 수신 콜백 */
  onMessageReceive?: (message: Message) => void;

  /** 위젯 열림/닫힘 콜백 */
  onToggle?: (isOpen: boolean) => void;
}

/**
 * 커스텀 스타일
 */
export interface CustomStyles {
  container?: CSSProperties;
  launcher?: CSSProperties;
  header?: CSSProperties;
  messageList?: CSSProperties;
  input?: CSSProperties;
}

/**
 * 런처 렌더 Props
 */
export interface LauncherRenderProps {
  isOpen: boolean;
  toggle: () => void;
  unreadCount: number;
}

/**
 * 채팅 뷰 타입
 */
export type ChatView = 'home' | 'chat' | 'settings';

/**
 * 채팅 컨텍스트 값
 */
export interface ChatContextValue {
  // 설정
  config: WidgetConfig;

  // 세션
  sessionId: string | null;
  isSessionLoading: boolean;

  // 메시지
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  // 뷰
  currentView: ChatView;
  setCurrentView: (view: ChatView) => void;

  // 액션
  sendMessage: (content: string) => Promise<void>;
  startChat: () => Promise<void>;
}

export type { Message };
