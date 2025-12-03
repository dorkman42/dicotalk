import {
  Client,
  GatewayIntentBits,
  Events,
  ThreadChannel,
  Message as DiscordMessage,
} from 'discord.js';
import { ThreadManager } from './services/ThreadManager.js';
import { MessageStore } from './services/MessageStore.js';
import type { BotConfig, SessionInfo, StoredMessage } from './types.js';

/**
 * Dicotalk Discord 봇
 *
 * @example
 * ```ts
 * const bot = new DicotalkBot({
 *   token: process.env.DISCORD_BOT_TOKEN,
 *   channelId: process.env.DISCORD_CHANNEL_ID,
 *   agentName: '상담사',
 * });
 *
 * await bot.start();
 * ```
 */
export class DicotalkBot {
  private client: Client;
  private threadManager: ThreadManager;
  private messageStore: MessageStore;
  private config: BotConfig;
  private isReady = false;

  constructor(config: BotConfig) {
    this.config = config;

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.threadManager = new ThreadManager(this.client, config);
    this.messageStore = new MessageStore({
      maxMessagesPerSession: config.maxMessagesPerSession ?? 100,
      messageRetentionMs: config.messageRetentionMs ?? 24 * 60 * 60 * 1000,
    });

    this.setupEventHandlers();
  }

  /**
   * 이벤트 핸들러 설정
   */
  private setupEventHandlers(): void {
    this.client.once(Events.ClientReady, (readyClient) => {
      console.log(`[DicotalkBot] Ready! Logged in as ${readyClient.user.tag}`);
      this.isReady = true;
    });

    // 상담사 답변 감지
    this.client.on(Events.MessageCreate, async (message) => {
      await this.handleAgentMessage(message);
    });

    // 에러 핸들링
    this.client.on(Events.Error, (error) => {
      console.error('[DicotalkBot] Client error:', error);
    });
  }

  /**
   * 상담사 메시지 처리
   */
  private async handleAgentMessage(message: DiscordMessage): Promise<void> {
    // 봇 메시지 무시
    if (message.author.bot) return;

    // 스레드 메시지만 처리
    if (!message.channel.isThread()) return;

    const thread = message.channel as ThreadChannel;

    // 이 스레드가 관리되는 세션인지 확인
    const sessionId = this.threadManager.getSessionByThreadId(thread.id);
    if (!sessionId) return;

    // 메시지 저장
    const storedMessage: StoredMessage = {
      id: message.id,
      content: message.content,
      sender: 'agent',
      timestamp: message.createdTimestamp,
      agentName: this.config.agentName || message.author.displayName,
      agentAvatar: this.config.agentAvatar || message.author.displayAvatarURL(),
    };

    this.messageStore.addMessage(sessionId, storedMessage);

    console.log(`[DicotalkBot] Agent message stored for session ${sessionId}`);
  }

  /**
   * 봇 시작
   */
  async start(): Promise<void> {
    await this.client.login(this.config.token);
  }

  /**
   * 봇 중지
   */
  async stop(): Promise<void> {
    this.client.destroy();
    this.messageStore.destroy();
    this.isReady = false;
  }

  /**
   * 새 세션 생성 및 Discord 스레드 생성
   */
  async createSession(
    metadata?: Record<string, unknown>
  ): Promise<SessionInfo> {
    if (!this.isReady) {
      throw new Error('Bot is not ready');
    }

    const sessionId = this.generateSessionId();
    const thread = await this.threadManager.createThread(sessionId, metadata);

    return {
      sessionId,
      threadId: thread.id,
      createdAt: Date.now(),
    };
  }

  /**
   * 고객 메시지를 Discord 스레드로 전송
   */
  async sendCustomerMessage(
    sessionId: string,
    content: string
  ): Promise<{ messageId: string }> {
    if (!this.isReady) {
      throw new Error('Bot is not ready');
    }

    const thread = await this.threadManager.getThread(sessionId);
    if (!thread) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Discord로 메시지 전송
    const discordMessage = await thread.send({
      content: `**고객**: ${content}`,
    });

    // 메시지 저장 (폴링 시 중복 방지용)
    const storedMessage: StoredMessage = {
      id: discordMessage.id,
      content,
      sender: 'user',
      timestamp: Date.now(),
    };
    this.messageStore.addMessage(sessionId, storedMessage);

    return { messageId: discordMessage.id };
  }

  /**
   * 특정 세션의 새 메시지 조회 (폴링용)
   */
  getMessages(sessionId: string, afterMessageId?: string): StoredMessage[] {
    return this.messageStore.getMessages(sessionId, afterMessageId);
  }

  /**
   * 세션이 존재하는지 확인
   */
  hasSession(sessionId: string): boolean {
    return this.threadManager.hasSession(sessionId);
  }

  /**
   * 봇 준비 상태 확인
   */
  get ready(): boolean {
    return this.isReady;
  }

  /**
   * 세션 ID 생성
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `session_${timestamp}_${random}`;
  }
}
