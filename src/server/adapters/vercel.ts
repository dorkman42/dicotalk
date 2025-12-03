import type { DicotalkBot } from '../../bot/DicotalkBot.js';
import { createMessagesHandler } from '../handlers/messagesHandler.js';
import { createSessionHandler } from '../handlers/sessionHandler.js';
import type { RequestContext, ResponseContext } from './base.js';

export interface VercelAdapterOptions {
  cors?:
    | boolean
    | {
        origin: string | string[];
        credentials?: boolean;
      };
}

/**
 * Next.js App Router용 핸들러 생성
 *
 * @example
 * ```ts
 * // app/api/chat/[...path]/route.ts
 * import { createNextAppRouterHandler } from 'dicotalk/server/vercel';
 * import { bot } from '@/lib/bot';
 *
 * const handler = createNextAppRouterHandler(bot);
 * export { handler as GET, handler as POST, handler as OPTIONS };
 * ```
 */
export function createNextAppRouterHandler(
  bot: DicotalkBot,
  options?: VercelAdapterOptions
) {
  const messagesHandler = createMessagesHandler(bot);
  const sessionHandler = createSessionHandler(bot);
  const cors = options?.cors ?? false;

  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS 헤더
    const corsHeaders: Record<string, string> = {};
    if (cors) {
      const origin = typeof cors === 'object' ? cors.origin : '*';
      corsHeaders['Access-Control-Allow-Origin'] = Array.isArray(origin)
        ? origin.join(',')
        : origin;
      corsHeaders['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      corsHeaders['Access-Control-Allow-Headers'] = 'Content-Type';

      if (typeof cors === 'object' && cors.credentials) {
        corsHeaders['Access-Control-Allow-Credentials'] = 'true';
      }
    }

    // OPTIONS 요청 처리
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 요청 컨텍스트 생성
    const reqContext: RequestContext = {
      method,
      path,
      query: Object.fromEntries(url.searchParams),
      body: method === 'POST' ? await request.json().catch(() => ({})) : undefined,
      headers: Object.fromEntries(request.headers),
    };

    // 응답 빌더
    let responseData: unknown;
    let statusCode = 200;

    const resContext: ResponseContext = {
      status: (code: number) => {
        statusCode = code;
        return resContext;
      },
      json: (data: unknown) => {
        responseData = data;
      },
      send: (data: string) => {
        responseData = data;
      },
      setHeader: () => resContext,
    };

    // 라우팅
    if (path.endsWith('/session') && method === 'POST') {
      await sessionHandler.createSession(reqContext, resContext);
    } else if (path.endsWith('/messages')) {
      if (method === 'POST') {
        await messagesHandler.sendMessage(reqContext, resContext);
      } else if (method === 'GET') {
        await messagesHandler.getMessages(reqContext, resContext);
      } else {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(responseData), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  };
}

/**
 * Vercel Edge Function 또는 Node.js Function용 핸들러
 * (레거시 Pages Router 호환)
 */
export function createVercelHandler(
  bot: DicotalkBot,
  options?: VercelAdapterOptions
) {
  const messagesHandler = createMessagesHandler(bot);
  const sessionHandler = createSessionHandler(bot);
  const cors = options?.cors ?? false;

  interface VercelRequest {
    method?: string;
    url?: string;
    query: Record<string, string | string[] | undefined>;
    body: unknown;
    headers: Record<string, string | string[] | undefined>;
  }

  interface VercelResponse {
    status: (code: number) => VercelResponse;
    json: (data: unknown) => void;
    send: (data: string) => void;
    setHeader: (name: string, value: string) => VercelResponse;
    end: () => void;
  }

  function handleCors(req: VercelRequest, res: VercelResponse): boolean {
    if (!cors) return false;

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
      return true;
    }

    return false;
  }

  function adaptRequest(req: VercelRequest): RequestContext {
    return {
      method: req.method || 'GET',
      path: req.url || '/',
      query: req.query,
      body: req.body,
      headers: req.headers,
    };
  }

  function adaptResponse(res: VercelResponse): ResponseContext {
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

  return {
    // POST /api/chat/session
    session: async (req: VercelRequest, res: VercelResponse) => {
      if (handleCors(req, res)) return;

      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      await sessionHandler.createSession(adaptRequest(req), adaptResponse(res));
    },

    // POST/GET /api/chat/messages
    messages: async (req: VercelRequest, res: VercelResponse) => {
      if (handleCors(req, res)) return;

      if (req.method === 'POST') {
        await messagesHandler.sendMessage(adaptRequest(req), adaptResponse(res));
      } else if (req.method === 'GET') {
        await messagesHandler.getMessages(adaptRequest(req), adaptResponse(res));
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    },
  };
}
