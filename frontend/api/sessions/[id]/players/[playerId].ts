import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mutate } from '../../../../lib/apiHandler.js';
import { removePlayer } from '../../../../lib/gameLogic.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id, playerId } = req.query;
  if (typeof id !== 'string' || typeof playerId !== 'string') {
    return res.status(400).json({ error: 'Invalid params' });
  }

  await mutate(req, res, id, (state) => removePlayer(state, playerId));
}
