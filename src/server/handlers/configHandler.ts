import type { DicotalkBot } from '../../bot/DicotalkBot.js';
import type { RequestContext, ResponseContext } from '../adapters/base.js';

/**
 * 설정/정보 핸들러 생성
 */
export function createConfigHandler(bot: DicotalkBot) {
  return {
    /**
     * GET /config - Discord 서버 정보 조회
     * 위젯에서 서버명, 아이콘 등을 자동으로 표시할 때 사용
     */
    async getConfig(
      req: RequestContext,
      res: ResponseContext
    ): Promise<void> {
      try {
        const serverInfo = await bot.getServerInfo();

        if (!serverInfo) {
          res.status(503).json({
            success: false,
            error: '서버 정보를 가져올 수 없습니다',
          });
          return;
        }

        res.status(200).json({
          success: true,
          serverName: serverInfo.serverName,
          serverIcon: serverInfo.serverIcon,
          channelName: serverInfo.channelName,
        });
      } catch (error) {
        console.error('[configHandler] getConfig error:', error);
        res.status(500).json({
          success: false,
          error: '서버 정보 조회에 실패했습니다',
        });
      }
    },
  };
}
