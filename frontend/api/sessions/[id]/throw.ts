import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mutate } from '../../../lib/apiHandler.js';
import { processThrow } from '../../../lib/gameLogic.js';
import type { Multiplier } from '../../../lib/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });

  const { value, multiplier } = req.body as { value: number; multiplier: Multiplier };
  if (typeof value !== 'number' || ![1, 2, 3].includes(multiplier)) {
    return res.status(400).json({ error: 'Invalid throw data' });
  }

  await mutate(req, res, id, (state) => processThrow(state, value, multiplier));
}
