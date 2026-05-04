import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import { createGame } from '../../lib/gameLogic.js';
import { setSession } from '../../lib/kv.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const sessionId = uuidv4();
  const state = createGame(sessionId);
  await setSession(sessionId, state);
  res.status(201).json({ sessionId });
}
