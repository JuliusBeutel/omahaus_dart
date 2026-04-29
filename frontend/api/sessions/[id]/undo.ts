import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mutate } from '../../../lib/apiHandler.js';
import { undoLastThrow } from '../../../lib/gameLogic.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await mutate(req, res, 'POST', undoLastThrow);
}
