import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSession, setSession, deleteSession } from '../services/sessionStore';
import {
  createGame,
  addPlayer,
  removePlayer,
  reorderPlayers,
  setMode,
  startGame,
  processThrow,
  undoLastThrow,
  resetGame,
} from '../services/gameLogic';
import type { GameMode, Multiplier } from '../types/game';
import os from 'os';

const router = Router();

router.post('/sessions', (req, res) => {
  const sessionId = uuidv4();
  const state = createGame(sessionId);
  setSession(sessionId, state);
  res.status(201).json({ sessionId });
});

router.get('/sessions/:id', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  res.json(state);
});

router.delete('/sessions/:id', (req, res) => {
  deleteSession(req.params.id);
  res.status(204).end();
});

router.post('/sessions/:id/throw', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const { value, multiplier } = req.body as { value: number; multiplier: Multiplier };
  const newState = processThrow(state, value, multiplier);
  setSession(req.params.id, newState);
  res.json(newState);
});

router.post('/sessions/:id/undo', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const newState = undoLastThrow(state);
  setSession(req.params.id, newState);
  res.json(newState);
});

router.patch('/sessions/:id/mode', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const { mode } = req.body as { mode: GameMode };
  const newState = setMode(state, mode);
  setSession(req.params.id, newState);
  res.json(newState);
});

router.post('/sessions/:id/start', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const newState = startGame(state);
  setSession(req.params.id, newState);
  res.json(newState);
});

router.post('/sessions/:id/reset', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const newState = resetGame(state);
  setSession(req.params.id, newState);
  res.json(newState);
});

router.post('/sessions/:id/players', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const { name } = req.body as { name: string };
  const newState = addPlayer(state, name);
  setSession(req.params.id, newState);
  res.json(newState);
});

router.delete('/sessions/:id/players/:playerId', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const newState = removePlayer(state, req.params.playerId);
  setSession(req.params.id, newState);
  res.json(newState);
});

router.post('/sessions/:id/players/reorder', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const { orderedIds } = req.body as { orderedIds: string[] };
  const newState = reorderPlayers(state, orderedIds);
  setSession(req.params.id, newState);
  res.json(newState);
});

router.get('/local-ip', (_req, res) => {
  const nets = os.networkInterfaces();
  let localIp = 'localhost';
  for (const iface of Object.values(nets)) {
    for (const net of iface ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address;
        break;
      }
    }
  }
  res.json({ ip: localIp });
});

export default router;
