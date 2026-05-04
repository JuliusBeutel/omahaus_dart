import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mutate } from '../../../../lib/apiHandler.js';
import { addPlayer } from '../../../../lib/gameLogic.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });

  const { name } = req.body as { name: string };
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Invalid player name' });
  }

  await mutate(req, res, id, (state) => addPlayer(state, name));
}
