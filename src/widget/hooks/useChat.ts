import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message } from '../types.js';

interface UseChatOptions {
  apiEndpoint: string;
  sessionId: string | null;
  pollingInterval: number;
  onMessageReceive?: (message: Message) => void;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

/**
 * 채팅 훅 (메시지 전송/수신, 폴링)
 */
export function useChat({
  apiEndpoint,
  sessionId,
  pollingInterval,
  onMessageReceive,
}: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastMessageIdRef = useRef<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);

  /**
   * 메시지 전송
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || !content.trim()) return;

      // 낙관적 업데이트
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        content,
        sender: 'user',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiEndpoint}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            content,
          }),
        });

        if (!response.ok) {
          throw new Error('메시지 전송에 실패했습니다');
        }

        const data = await response.json();

        // 임시 메시지를 실제 메시지로 교체
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...msg, id: data.messageId }
              : msg
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
        // 실패 시 임시 메시지 제거
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id)
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiEndpoint, sessionId]
  );

  /**
   * 폴링으로 새 메시지 가져오기
   */
  const fetchMessages = useCallback(async () => {
    if (!sessionId || isPollingRef.current) return;

    isPollingRef.current = true;

    try {
      const params = new URLSearchParams({ sessionId });
      if (lastMessageIdRef.current) {
        params.append('after', lastMessageIdRef.current);
      }

      const response = await fetch(`${apiEndpoint}/messages?${params}`);

      if (!response.ok) return;

      const data = await response.json();

      if (data.messages && data.messages.length > 0) {
        const newMessages = data.messages as Message[];

        if (newMessages.length > 0) {
          setMessages((prev) => [...prev, ...newMessages]);
          lastMessageIdRef.current = newMessages[newMessages.length - 1].id;

          // 콜백 호출
          newMessages.forEach((msg) => {
            onMessageReceive?.(msg);
          });
        }
      }
    } catch {
      // 폴링 실패는 조용히 무시
    } finally {
      isPollingRef.current = false;
    }
  }, [apiEndpoint, sessionId, onMessageReceive]);

  /**
   * 폴링 시작/중지
   */
  useEffect(() => {
    if (sessionId && pollingInterval > 0) {
      // 즉시 한 번 실행
      fetchMessages();

      // 인터벌 설정
      pollingRef.current = setInterval(fetchMessages, pollingInterval);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [sessionId, pollingInterval, fetchMessages]);

  /**
   * 메시지 초기화
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    lastMessageIdRef.current = null;
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
