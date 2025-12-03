import { useState, useEffect } from 'react';

interface ServerConfig {
  serverName: string;
  serverIcon: string | null;
  channelName: string;
}

interface UseServerConfigOptions {
  apiEndpoint: string;
  enabled?: boolean;
}

interface UseServerConfigReturn {
  serverConfig: ServerConfig | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Discord 서버 정보 자동 로드 훅
 */
export function useServerConfig({
  apiEndpoint,
  enabled = true,
}: UseServerConfigOptions): UseServerConfigReturn {
  const [serverConfig, setServerConfig] = useState<ServerConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchConfig = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiEndpoint}/config`);

        if (!response.ok) {
          // 서버 정보 없으면 그냥 무시 (환경 변수로 설정 가능)
          return;
        }

        const data = await response.json();

        if (data.success) {
          setServerConfig({
            serverName: data.serverName,
            serverIcon: data.serverIcon,
            channelName: data.channelName,
          });
        }
      } catch {
        // 에러 무시 - 서버 정보는 선택적
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [apiEndpoint, enabled]);

  return {
    serverConfig,
    isLoading,
    error,
  };
}
