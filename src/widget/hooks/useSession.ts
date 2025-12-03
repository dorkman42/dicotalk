import { useState, useCallback } from 'react';

const SESSION_STORAGE_KEY = 'dicotalk-session';

interface UseSessionOptions {
  apiEndpoint: string;
  initialSessionId?: string;
  onSessionCreate?: (sessionId: string) => void;
}

interface UseSessionReturn {
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  createSession: () => Promise<string>;
  clearSession: () => void;
}

/**
 * 세션 관리 훅
 */
export function useSession({
  apiEndpoint,
  initialSessionId,
  onSessionCreate,
}: UseSessionOptions): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(() => {
    // props로 받은 세션 ID 우선
    if (initialSessionId) return initialSessionId;

    // localStorage에서 복원
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SESSION_STORAGE_KEY);
    }

    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiEndpoint}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: {
            userAgent:
              typeof navigator !== 'undefined' ? navigator.userAgent : '',
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            timestamp: Date.now(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('세션 생성 실패');
      }

      const data = await response.json();
      const newSessionId = data.sessionId;

      setSessionId(newSessionId);

      // localStorage에 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
      }

      onSessionCreate?.(newSessionId);

      return newSessionId;
    } catch (err) {
      const message = err instanceof Error ? err.message : '세션 생성 실패';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint, onSessionCreate]);

  const clearSession = useCallback(() => {
    setSessionId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  return {
    sessionId,
    isLoading,
    error,
    createSession,
    clearSession,
  };
}
