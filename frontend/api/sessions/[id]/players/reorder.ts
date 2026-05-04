import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mutate } from '../../../../lib/apiHandler.js';
import { reorderPlayers } from '../../../../lib/gameLogic.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });

  const { orderedIds } = req.body as { orderedIds: string[] };
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'Invalid orderedIds' });
  }

  await mutate(req, res, id, (state) => reorderPlayers(state, orderedIds));
}
