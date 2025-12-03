/**
 * 메시지 타입
 */
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: number;
  agentName?: string;
  agentAvatar?: string;
}

/**
 * 세션 정보
 */
export interface Session {
  sessionId: string;
  threadId: string;
  createdAt: number;
  status: 'active' | 'closed';
}

/**
 * API 응답 타입
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 세션 생성 응답
 */
export interface CreateSessionResponse {
  sessionId: string;
  threadId: string;
  createdAt: number;
}

/**
 * 메시지 전송 응답
 */
export interface SendMessageResponse {
  messageId: string;
}

/**
 * 메시지 조회 응답
 */
export interface GetMessagesResponse {
  messages: Message[];
}
