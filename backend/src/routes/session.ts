import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as store from '../services/sessionStore';
import * as logic from '../services/gameLogic';
import * as sse from '../sse/sseManager';
import type { GameMode, GameState, Multiplier } from '../types/game';

const router = Router();

function getSession(res: Response, sessionId: string) {
  const state = store.get(sessionId);
  if (!state) {
    res.status(404).json({ error: 'Session not found' });
    return null;
  }
  return state;
}

function mutate(
  res: Response,
  sessionId: string,
  updater: (s: GameState) => GameState
) {
  const state = getSession(res, sessionId);
  if (!state) return;
  const next = updater(state);
  store.set(next);
  sse.broadcast(sessionId, next);
  res.json(next);
}

router.post('/', (_req: Request, res: Response) => {
  const sessionId = uuidv4().slice(0, 6).toUpperCase();
  const state = logic.createSession(sessionId);
  store.set(state);
  res.status(201).json({ sessionId });
});

router.get('/:id', (req: Request, res: Response) => {
  const state = getSession(res, req.params.id);
  if (state) res.json(state);
});

router.get('/:id/events', (req: Request, res: Response) => {
  const state = getSession(res, req.params.id);
  if (!state) return;
  sse.subscribe(req.params.id, res);
  res.write(`data: ${JSON.stringify(state)}\n\n`);
});

router.post('/:id/players', (req: Request, res: Response) => {
  const { name } = req.body as { name: string };
  if (!name?.trim()) { res.status(400).json({ error: 'Name required' }); return; }
  mutate(res, req.params.id, (s) => logic.addPlayer(s, name.trim()));
});

router.delete('/:id/players/:playerId', (req: Request, res: Response) => {
  mutate(res, req.params.id, (s) => logic.removePlayer(s, req.params.playerId));
});

router.patch('/:id/mode', (req: Request, res: Response) => {
  const { mode } = req.body as { mode: GameMode };
  if (mode !== 301 && mode !== 501) { res.status(400).json({ error: 'Mode must be 301 or 501' }); return; }
  mutate(res, req.params.id, (s) => logic.setMode(s, mode));
});

router.post('/:id/start', (req: Request, res: Response) => {
  mutate(res, req.params.id, (s) => logic.startGame(s));
});

router.post('/:id/throw', (req: Request, res: Response) => {
  const { value, multiplier } = req.body as { value: number; multiplier: Multiplier };
  if (!value || !multiplier) { res.status(400).json({ error: 'value and multiplier required' }); return; }
  mutate(res, req.params.id, (s) => logic.applyThrow(s, value, multiplier));
});

router.post('/:id/undo', (req: Request, res: Response) => {
  mutate(res, req.params.id, (s) => logic.undoLastThrow(s));
});

router.post('/:id/reset', (req: Request, res: Response) => {
  mutate(res, req.params.id, (s) => logic.resetGame(s));
});

export default router;
