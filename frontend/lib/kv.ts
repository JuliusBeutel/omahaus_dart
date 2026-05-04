import { Redis } from '@upstash/redis';
import type { GameState } from './types.js';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const TTL_SECONDS = 60 * 60 * 24;

export async function getSession(sessionId: string): Promise<GameState | null> {
  const data = await redis.get<GameState>(`session:${sessionId}`);
  return data ?? null;
}

export async function setSession(sessionId: string, state: GameState): Promise<void> {
  await redis.set(`session:${sessionId}`, state, { ex: TTL_SECONDS });
}

export async function deleteSession(sessionId: string): Promise<void> {
  await redis.del(`session:${sessionId}`);
}
