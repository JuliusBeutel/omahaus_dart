import type { VercelRequest, VercelResponse } from '@vercel/node';
import { controlPlug } from '../../../lib/tuya.js';
import { getSession, setSession } from '../../../lib/kv.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });

  const { on } = req.body as { on: boolean };
  if (typeof on !== 'boolean') return res.status(400).json({ error: 'Invalid body' });

  if (on) {
    const state = await getSession(id);
    if (state && !state.controllerJoined) {
      await setSession(id, { ...state, controllerJoined: true });
    }
  }

  try {
    await controlPlug(on);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Tuya plug error', err);
    return res.status(502).json({ error: 'Tuya API error' });
  }
}
