import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mutate } from '../../../lib/apiHandler';
import { undoLastThrow } from '../../../lib/gameLogic';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await mutate(req, res, 'POST', undoLastThrow);
}
