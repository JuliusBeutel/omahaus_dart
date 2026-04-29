import { useEffect, useState } from 'react';
import type { GameState } from '../types/game';

export function useGameState(sessionId: string | null): GameState | null {
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let active = true;

    async function poll() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (res.ok && active) setState(await res.json() as GameState);
      } catch {
        // network error — keep last state, retry on next tick
      }
    }

    poll();
    const interval = setInterval(poll, 800);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [sessionId]);

  return state;
}
