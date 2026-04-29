import { useEffect, useState } from 'react';
import type { GameState } from '../types/game';

export function useGameState(sessionId: string | null): GameState | null {
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let source: EventSource;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      source = new EventSource(`/api/sessions/${sessionId}/events`);
      source.onmessage = (e) => setState(JSON.parse(e.data) as GameState);
      source.onerror = () => {
        source.close();
        retryTimeout = setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      source?.close();
      clearTimeout(retryTimeout);
    };
  }, [sessionId]);

  return state;
}
