import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSession } from '../../lib/gameLogic';
import { saveSession } from '../../lib/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.status(405).end(); return; }

  const sessionId = Math.random().toString(36).slice(2, 8).toUpperCase();
  const state = createSession(sessionId);
  await saveSession(state);
  res.status(201).json({ sessionId });
}
