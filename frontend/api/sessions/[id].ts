import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../lib/kv.js';
import { sessionId } from '../../lib/apiHandler.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') { res.status(405).end(); return; }

  const state = await getSession(sessionId(req));
  if (!state) { res.status(404).json({ error: 'Session not found' }); return; }
  res.json(state);
}
