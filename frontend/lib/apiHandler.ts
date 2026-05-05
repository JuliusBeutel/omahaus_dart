import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession, setSession } from './kv.js';
import type { GameState } from './types.js';

export async function mutate(
  _req: VercelRequest,
  res: VercelResponse,
  sessionId: string,
  transform: (state: GameState) => GameState
): Promise<void> {
  const state = await getSession(sessionId);
  if (!state) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  const newState = { ...transform(state), lastActivity: Date.now() };
  await setSession(sessionId, newState);
  res.status(200).json(newState);
}
