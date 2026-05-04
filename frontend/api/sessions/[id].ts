import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession, deleteSession } from '../../lib/kv.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    const state = await getSession(id);
    if (!state) return res.status(404).json({ error: 'Session not found' });
    return res.status(200).json(state);
  }

  if (req.method === 'DELETE') {
    await deleteSession(id);
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
