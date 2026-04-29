import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mutate } from '../../../../lib/apiHandler';
import { addPlayer } from '../../../../lib/gameLogic';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await mutate(req, res, 'POST', (state) => {
    const { name } = req.body as { name: string };
    if (!name?.trim()) throw new Error('Name required');
    return addPlayer(state, name.trim());
  });
}
