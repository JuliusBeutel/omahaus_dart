import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mutate } from '../../../../../lib/apiHandler';
import { removePlayer } from '../../../../../lib/gameLogic';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await mutate(req, res, 'DELETE', (state, r) => {
    const { playerId } = r.query as Record<string, string>;
    return removePlayer(state, playerId);
  });
}
