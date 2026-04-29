import { Redis } from '@upstash/redis';
import type { GameState } from './types';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export async function getSession(sessionId: string): Promise<GameState | null> {
  return redis.get<GameState>(`session:${sessionId}`);
}

export async function saveSession(state: GameState): Promise<void> {
  await redis.set(`session:${state.sessionId}`, state, { ex: SESSION_TTL_SECONDS });
}
