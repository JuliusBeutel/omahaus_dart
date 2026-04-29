import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mutate } from '../../../lib/apiHandler.js';
import { setMode } from '../../../lib/gameLogic.js';
import type { GameMode } from '../../../lib/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await mutate(req, res, 'PATCH', (state) => {
    const { mode } = req.body as { mode: GameMode };
    return setMode(state, mode);
  });
}
