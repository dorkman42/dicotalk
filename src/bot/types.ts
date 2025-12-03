import type { Message } from '../shared/types.js';

/**
 * 봇 설정
 */
export interface BotConfig {
  /** Discord 봇 토큰 */
  token: string;

  /** 상담 채널 ID (스레드가 생성될 채널) */
  channelId: string;

  /** 세션당 최대 메시지 수 (기본: 100) */
  maxMessagesPerSession?: number;

  /** 메시지 보관 기간 ms (기본: 24시간) */
  messageRetentionMs?: number;

  /** 상담사 이름 (위젯에 표시) */
  agentName?: string;

  /** 상담사 아바타 URL */
  agentAvatar?: string;
}

/**
 * 세션 정보
 */
export interface SessionInfo {
  sessionId: string;
  threadId: string;
  createdAt: number;
}

/**
 * 저장된 메시지
 */
export interface StoredMessage extends Message {
  metadata?: Record<string, unknown>;
}
