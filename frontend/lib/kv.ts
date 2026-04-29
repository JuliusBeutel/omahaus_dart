import { Redis } from '@upstash/redis';
import type { GameState } from './types.js';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const SESSION_TTL_SECONDS = 60 * 60 * 24;

export async function getSession(sessionId: string): Promise<GameState | null> {
  return redis.get<GameState>(`session:${sessionId}`);
}

export async function saveSession(state: GameState): Promise<void> {
  await redis.set(`session:${state.sessionId}`, state, { ex: SESSION_TTL_SECONDS });
}
