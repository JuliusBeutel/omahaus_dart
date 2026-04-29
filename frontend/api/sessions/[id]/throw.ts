import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mutate } from '../../../lib/apiHandler';
import { applyThrow } from '../../../lib/gameLogic';
import type { Multiplier } from '../../../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await mutate(req, res, 'POST', (state) => {
    const { value, multiplier } = req.body as { value: number; multiplier: Multiplier };
    return applyThrow(state, value, multiplier);
  });
}
