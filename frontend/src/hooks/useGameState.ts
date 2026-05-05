import { useState, useEffect, useRef } from 'react';
import type { GameState } from '../types/game';
import { getSession } from '../api/client';

const SESSION_TIMEOUT_MS = 5 * 60 * 1000;

export function useGameState(sessionId: string): { state: GameState | null; notFound: boolean; timedOut: boolean } {
  const [state, setState] = useState<GameState | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const hasLoadedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const data = await getSession(sessionId);
        if (active) {
          if (Date.now() - data.lastActivity > SESSION_TIMEOUT_MS) {
            setTimedOut(true);
            return;
          }
          setState(data);
          hasLoadedRef.current = true;
        }
      } catch (err) {
        console.error('[useGameState] poll failed:', err);
        if (active && err instanceof Error && err.message === 'API error 404') {
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

  return { state, notFound, timedOut };
}
