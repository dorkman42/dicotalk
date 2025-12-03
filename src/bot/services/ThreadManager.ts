import {
  Client,
  ForumChannel,
  ThreadChannel,
  ChannelType,
} from 'discord.js';
import type { BotConfig } from '../types.js';

/**
 * Discord 포럼 채널 관리자
 * - 세션별 포럼 포스트 생성/관리
 * - 세션 ID ↔ 포스트(스레드) ID 매핑
 * - 태그로 상담 상태 관리
 */
export class ThreadManager {
  private client: Client;
  private config: BotConfig;

  // sessionId -> threadId 매핑
  private sessionToThread = new Map<string, string>();
  // threadId -> sessionId 역매핑
  private threadToSession = new Map<string, string>();

  constructor(client: Client, config: BotConfig) {
    this.client = client;
    this.config = config;
  }

  /**
   * 새 포럼 포스트 생성
   */
  async createThread(
    sessionId: string,
    metadata?: Record<string, unknown>
  ): Promise<ThreadChannel> {
    const forumChannel = await this.getForumChannel();

    const postName = this.formatPostName(sessionId);
    const content = this.formatWelcomeMessage(sessionId, metadata);

    // 대기중 태그 찾기
    const waitingTag = forumChannel.availableTags.find(
      (tag) => tag.name === '대기중' || tag.name.toLowerCase() === 'waiting'
    );

    // 포럼 포스트 생성
    const post = await forumChannel.threads.create({
      name: postName,
      autoArchiveDuration: 1440, // 24시간
      message: { content },
      appliedTags: waitingTag ? [waitingTag.id] : [],
      reason: `Customer support session: ${sessionId}`,
    });

    // 매핑 저장
    this.sessionToThread.set(sessionId, post.id);
    this.threadToSession.set(post.id, sessionId);

    return post;
  }

  /**
   * 세션의 포스트(스레드) 조회
   */
  async getThread(sessionId: string): Promise<ThreadChannel | null> {
    const threadId = this.sessionToThread.get(sessionId);
    if (!threadId) return null;

    try {
      const channel = await this.client.channels.fetch(threadId);
      if (channel?.isThread()) {
        return channel as ThreadChannel;
      }
    } catch {
      // 포스트가 삭제되었을 수 있음
      this.sessionToThread.delete(sessionId);
      this.threadToSession.delete(threadId);
    }

    return null;
  }

  /**
   * 스레드 ID로 세션 ID 조회
   */
  getSessionByThreadId(threadId: string): string | undefined {
    return this.threadToSession.get(threadId);
  }

  /**
   * 세션 존재 여부 확인
   */
  hasSession(sessionId: string): boolean {
    return this.sessionToThread.has(sessionId);
  }

  /**
   * 상담 상태 업데이트 (태그 변경)
   */
  async updateStatus(
    sessionId: string,
    status: 'waiting' | 'in-progress' | 'completed'
  ): Promise<void> {
    const thread = await this.getThread(sessionId);
    if (!thread) return;

    const forumChannel = await this.getForumChannel();

    const statusTagMap: Record<string, string[]> = {
      waiting: ['대기중', 'waiting'],
      'in-progress': ['진행중', 'in-progress'],
      completed: ['완료', 'completed', 'done'],
    };

    const targetTagNames = statusTagMap[status];
    const targetTag = forumChannel.availableTags.find((tag) =>
      targetTagNames.includes(tag.name.toLowerCase())
    );

    if (targetTag) {
      await thread.setAppliedTags([targetTag.id]);
    }
  }

  /**
   * 포럼 채널 조회
   */
  private async getForumChannel(): Promise<ForumChannel> {
    const channel = await this.client.channels.fetch(this.config.channelId);

    if (!channel || channel.type !== ChannelType.GuildForum) {
      throw new Error(
        `Channel ${this.config.channelId} is not a forum channel. ` +
          `Please create a forum channel and use its ID.`
      );
    }

    return channel as ForumChannel;
  }

  /**
   * 포스트 이름 포맷
   */
  private formatPostName(sessionId: string): string {
    const timestamp = new Date().toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const shortId = sessionId.slice(-6).toUpperCase();

    return `상담 #${shortId} (${timestamp})`;
  }

  /**
   * 환영 메시지 포맷
   */
  private formatWelcomeMessage(
    sessionId: string,
    metadata?: Record<string, unknown>
  ): string {
    let message = `## 🎫 새 고객 상담\n\n`;
    message += `**세션 ID**: \`${sessionId}\`\n`;
    message += `**시작 시간**: ${new Date().toLocaleString('ko-KR')}\n`;

    if (metadata) {
      message += `\n### 📋 고객 정보\n`;
      if (metadata.referrer) {
        message += `- **유입 경로**: ${metadata.referrer}\n`;
      }
      if (metadata.userAgent) {
        const ua = String(metadata.userAgent);
        const browser = this.parseBrowser(ua);
        message += `- **브라우저**: ${browser}\n`;
      }
    }

    message += `\n---\n*이 스레드에서 답변을 작성하면 고객에게 전달됩니다.*`;

    return message;
  }

  /**
   * User Agent에서 브라우저 정보 추출
   */
  private parseBrowser(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }
}
