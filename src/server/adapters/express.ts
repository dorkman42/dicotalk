import type { DicotalkBot } from '../../bot/DicotalkBot.js';
import { createMessagesHandler } from '../handlers/messagesHandler.js';
import { createSessionHandler } from '../handlers/sessionHandler.js';
import type { RequestContext, ResponseContext } from './base.js';

export interface ExpressAdapterOptions {
  bot: DicotalkBot;
  cors?:
    | boolean
    | {
        origin: string | string[];
        credentials?: boolean;
      };
}

// Express 타입 (의존성 최소화를 위해 인라인 정의)
interface ExpressRequest {
  method: string;
  path: string;
  query: Record<string, string | string[] | undefined>;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
}

interface ExpressResponse {
  status: (code: number) => ExpressResponse;
  json: (data: unknown) => void;
  send: (data: string) => void;
  setHeader: (name: string, value: string) => ExpressResponse;
  end: () => void;
}

interface ExpressRouter {
  use: (handler: ExpressMiddleware) => void;
  post: (path: string, handler: ExpressRouteHandler) => void;
  get: (path: string, handler: ExpressRouteHandler) => void;
}

type ExpressMiddleware = (
  req: ExpressRequest,
  res: ExpressResponse,
  next: () => void
) => void;

type ExpressRouteHandler = (
  req: ExpressRequest,
  res: ExpressResponse
) => Promise<void>;

function adaptRequest(req: ExpressRequest): RequestContext {
  return {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: req.headers,
  };
}

function adaptResponse(res: ExpressResponse): ResponseContext {
  return {
    status: (code: number) => {
      res.status(code);
      return adaptResponse(res);
    },
    json: (data: unknown) => {
      res.json(data);
    },
    send: (data: string) => {
      res.send(data);
    },
    setHeader: (name: string, value: string) => {
      res.setHeader(name, value);
      return adaptResponse(res);
    },
  };
}

/**
 * Express 라우터 생성
 *
 * @example
 * ```ts
 * import express from 'express';
 * import { DicotalkBot } from 'dicotalk/bot';
 * import { createExpressRouter } from 'dicotalk/server/express';
 *
 * const bot = new DicotalkBot({ token: '...', channelId: '...' });
 * const app = express();
 *
 * app.use('/api/chat', createExpressRouter({ bot, cors: true }));
 * ```
 */
export function createExpressRouter(options: ExpressAdapterOptions): ExpressRouter {
  // 동적 import로 express 가져오기
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const express = require('express');
  const router = express.Router() as ExpressRouter;

  const { bot, cors = false } = options;
  const messagesHandler = createMessagesHandler(bot);
  const sessionHandler = createSessionHandler(bot);

  // CORS 미들웨어
  if (cors) {
    router.use((req: ExpressRequest, res: ExpressResponse, next: () => void) => {
      const origin = typeof cors === 'object' ? cors.origin : '*';
      res.setHeader(
        'Access-Control-Allow-Origin',
        Array.isArray(origin) ? origin.join(',') : origin
      );
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (typeof cors === 'object' && cors.credentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }

      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
      }
      next();
    });
  }

  // JSON 파싱
  router.use(express.json());

  // 라우트 등록
  router.post('/session', async (req: ExpressRequest, res: ExpressResponse) => {
    await sessionHandler.createSession(adaptRequest(req), adaptResponse(res));
  });

  router.post('/messages', async (req: ExpressRequest, res: ExpressResponse) => {
    await messagesHandler.sendMessage(adaptRequest(req), adaptResponse(res));
  });

  router.get('/messages', async (req: ExpressRequest, res: ExpressResponse) => {
    await messagesHandler.getMessages(adaptRequest(req), adaptResponse(res));
  });

  return router;
}
