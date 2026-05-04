import { useState, useEffect, useRef } from 'react';
import type { GameState } from '../types/game';
import { getSession } from '../api/client';

export function useGameState(sessionId: string): { state: GameState | null; notFound: boolean } {
  const [state, setState] = useState<GameState | null>(null);
  const [notFound, setNotFound] = useState(false);
  const hasLoadedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const data = await getSession(sessionId);
        if (active) {
          setState(data);
          hasLoadedRef.current = true;
        }
      } catch (err) {
        if (active && hasLoadedRef.current && err instanceof Error && err.message === 'API error 404') {
          setNotFound(true);
        }
      }
    }

    poll();
    intervalRef.current = setInterval(poll, 800);

    return () => {
      active = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionId]);

  return { state, notFound };
}
