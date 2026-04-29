import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mutate } from '../../../lib/apiHandler';
import { setMode } from '../../../lib/gameLogic';
import type { GameMode } from '../../../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await mutate(req, res, 'PATCH', (state) => {
    const { mode } = req.body as { mode: GameMode };
    return setMode(state, mode);
  });
}
