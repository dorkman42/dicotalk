import type { StoredMessage } from '../types.js';

interface MessageStoreConfig {
  maxMessagesPerSession: number;
  messageRetentionMs: number;
}

/**
 * 인메모리 메시지 저장소
 * - 세션별 메시지 저장
 * - 자동 정리 (retention 기간 초과 시)
 */
export class MessageStore {
  private config: MessageStoreConfig;
  private messages = new Map<string, StoredMessage[]>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: MessageStoreConfig) {
    this.config = config;
    this.startCleanupInterval();
  }

  /**
   * 메시지 추가
   */
  addMessage(sessionId: string, message: StoredMessage): void {
    if (!this.messages.has(sessionId)) {
      this.messages.set(sessionId, []);
    }

    const sessionMessages = this.messages.get(sessionId)!;
    sessionMessages.push(message);

    // 최대 메시지 수 제한
    if (sessionMessages.length > this.config.maxMessagesPerSession) {
      sessionMessages.shift();
    }
  }

  /**
   * 메시지 조회 (폴링용)
   * @param sessionId 세션 ID
   * @param afterMessageId 이 메시지 ID 이후의 메시지만 반환
   */
  getMessages(sessionId: string, afterMessageId?: string): StoredMessage[] {
    const sessionMessages = this.messages.get(sessionId) || [];

    if (!afterMessageId) {
      // 상담사 메시지만 반환
      return sessionMessages.filter((msg) => msg.sender === 'agent');
    }

    // afterMessageId 이후의 상담사 메시지만 반환
    const afterIndex = sessionMessages.findIndex(
      (msg) => msg.id === afterMessageId
    );

    if (afterIndex === -1) {
      return sessionMessages.filter((msg) => msg.sender === 'agent');
    }

    return sessionMessages
      .slice(afterIndex + 1)
      .filter((msg) => msg.sender === 'agent');
  }

  /**
   * 세션 존재 여부 확인
   */
  hasSession(sessionId: string): boolean {
    return this.messages.has(sessionId);
  }

  /**
   * 세션 삭제
   */
  clearSession(sessionId: string): void {
    this.messages.delete(sessionId);
  }

  /**
   * 정리 인터벌 시작
   */
  private startCleanupInterval(): void {
    // 1시간마다 오래된 메시지 정리
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      60 * 60 * 1000
    );
  }

  /**
   * 오래된 세션 정리
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [sessionId, messages] of this.messages.entries()) {
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (now - lastMessage.timestamp > this.config.messageRetentionMs) {
          this.messages.delete(sessionId);
        }
      }
    }
  }

  /**
   * 리소스 정리
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.messages.clear();
  }
}
