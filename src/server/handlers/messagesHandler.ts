import type { DicotalkBot } from '../../bot/DicotalkBot.js';
import type { RequestContext, ResponseContext } from '../adapters/base.js';

/**
 * 메시지 핸들러 생성
 */
export function createMessagesHandler(bot: DicotalkBot) {
  return {
    /**
     * POST /messages - 고객 메시지 전송
     */
    async sendMessage(
      req: RequestContext,
      res: ResponseContext
    ): Promise<void> {
      try {
        const { sessionId, content } = req.body as {
          sessionId: string;
          content: string;
        };

        if (!sessionId || !content) {
          res.status(400).json({
            success: false,
            error: 'sessionId와 content는 필수입니다',
          });
          return;
        }

        if (!bot.hasSession(sessionId)) {
          res.status(404).json({
            success: false,
            error: '세션을 찾을 수 없습니다',
          });
          return;
        }

        const result = await bot.sendCustomerMessage(sessionId, content);

        res.status(200).json({
          success: true,
          messageId: result.messageId,
        });
      } catch (error) {
        console.error('[messagesHandler] sendMessage error:', error);
        res.status(500).json({
          success: false,
          error: '메시지 전송에 실패했습니다',
        });
      }
    },

    /**
     * GET /messages - 새 메시지 조회 (폴링)
     */
    async getMessages(
      req: RequestContext,
      res: ResponseContext
    ): Promise<void> {
      try {
        const sessionId = req.query.sessionId as string;
        const after = req.query.after as string | undefined;

        if (!sessionId) {
          res.status(400).json({
            success: false,
            error: 'sessionId는 필수입니다',
          });
          return;
        }

        if (!bot.hasSession(sessionId)) {
          res.status(404).json({
            success: false,
            error: '세션을 찾을 수 없습니다',
          });
          return;
        }

        const messages = bot.getMessages(sessionId, after);

        res.status(200).json({
          success: true,
          messages,
        });
      } catch (error) {
        console.error('[messagesHandler] getMessages error:', error);
        res.status(500).json({
          success: false,
          error: '메시지 조회에 실패했습니다',
        });
      }
    },
  };
}
