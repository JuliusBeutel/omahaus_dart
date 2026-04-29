import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mutate } from '../../../lib/apiHandler';
import { resetGame } from '../../../lib/gameLogic';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await mutate(req, res, 'POST', resetGame);
}
