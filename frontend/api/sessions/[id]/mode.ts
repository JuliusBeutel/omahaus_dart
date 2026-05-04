import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mutate } from '../../../lib/apiHandler.js';
import { setMode } from '../../../lib/gameLogic.js';
import type { GameMode } from '../../../lib/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });

  const { mode } = req.body as { mode: GameMode };
  if (mode !== 301 && mode !== 501) {
    return res.status(400).json({ error: 'Invalid mode' });
  }

  await mutate(req, res, id, (state) => setMode(state, mode));
}
