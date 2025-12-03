/**
 * 요청 컨텍스트 (프레임워크 독립적)
 */
export interface RequestContext {
  method: string;
  path: string;
  query: Record<string, string | string[] | undefined>;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
}

/**
 * 응답 컨텍스트 (프레임워크 독립적)
 */
export interface ResponseContext {
  status: (code: number) => ResponseContext;
  json: (data: unknown) => void;
  send: (data: string) => void;
  setHeader: (name: string, value: string) => ResponseContext;
}

/**
 * 라우트 핸들러 타입
 */
export type RouteHandler = (
  req: RequestContext,
  res: ResponseContext
) => Promise<void> | void;
