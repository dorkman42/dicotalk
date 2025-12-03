import type { DicotalkBot } from '../../bot/DicotalkBot.js';
import type { RequestContext, ResponseContext } from '../adapters/base.js';

/**
 * 세션 핸들러 생성
 */
export function createSessionHandler(bot: DicotalkBot) {
  return {
    /**
     * POST /session - 새 세션 생성
     */
    async createSession(
      req: RequestContext,
      res: ResponseContext
    ): Promise<void> {
      try {
        const body = req.body as { metadata?: Record<string, unknown> } | undefined;
        const metadata = body?.metadata;

        const session = await bot.createSession(metadata);

        res.status(201).json({
          success: true,
          sessionId: session.sessionId,
          threadId: session.threadId,
          createdAt: session.createdAt,
        });
      } catch (error) {
        console.error('[sessionHandler] createSession error:', error);
        res.status(500).json({
          success: false,
          error: '세션 생성에 실패했습니다',
        });
      }
    },
  };
}
