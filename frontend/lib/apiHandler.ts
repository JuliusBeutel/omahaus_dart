import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession, saveSession } from './kv';
import type { GameState } from './types';

export function sessionId(req: VercelRequest): string {
  const { id } = req.query as Record<string, string>;
  return id;
}

export async function mutate(
  req: VercelRequest,
  res: VercelResponse,
  method: string,
  handler: (state: GameState, req: VercelRequest) => GameState | Promise<GameState>
): Promise<void> {
  if (req.method !== method) { res.status(405).end(); return; }

  const id = sessionId(req);
  const state = await getSession(id);
  if (!state) { res.status(404).json({ error: 'Session not found' }); return; }

  const next = await handler(state, req);
  await saveSession(next);
  res.json(next);
}
