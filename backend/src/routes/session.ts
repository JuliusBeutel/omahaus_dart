import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSession, setSession, deleteSession } from '../services/sessionStore';
import { controlPlug } from '../services/tuya';
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
import type { GameMode, GameState, Multiplier } from '../types/game';
import os from 'os';

const router = Router();

function touch(state: GameState): GameState {
  return { ...state, lastActivity: Date.now() };
}

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

router.post('/sessions/:id/join', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  if (!state.controllerJoined) {
    setSession(req.params.id, { ...state, controllerJoined: true });
  }
  res.json({ ok: true });
});

router.delete('/sessions/:id', (req, res) => {
  deleteSession(req.params.id);
  res.status(204).end();
});

router.post('/sessions/:id/throw', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const { value, multiplier } = req.body as { value: number; multiplier: Multiplier };
  const newState = touch(processThrow(state, value, multiplier));
  setSession(req.params.id, newState);
  res.json(newState);
});

router.post('/sessions/:id/undo', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const newState = touch(undoLastThrow(state));
  setSession(req.params.id, newState);
  res.json(newState);
});

router.patch('/sessions/:id/mode', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const { mode } = req.body as { mode: GameMode };
  const newState = touch(setMode(state, mode));
  setSession(req.params.id, newState);
  res.json(newState);
});

router.post('/sessions/:id/start', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const newState = touch(startGame(state));
  setSession(req.params.id, newState);
  res.json(newState);
});

router.post('/sessions/:id/reset', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const newState = touch(resetGame(state));
  setSession(req.params.id, newState);
  res.json(newState);
});

router.post('/sessions/:id/players', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const { name } = req.body as { name: string };
  const newState = touch(addPlayer(state, name));
  setSession(req.params.id, newState);
  res.json(newState);
});

router.delete('/sessions/:id/players/:playerId', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const newState = touch(removePlayer(state, req.params.playerId));
  setSession(req.params.id, newState);
  res.json(newState);
});

router.post('/sessions/:id/players/reorder', (req, res) => {
  const state = getSession(req.params.id);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  const { orderedIds } = req.body as { orderedIds: string[] };
  const newState = touch(reorderPlayers(state, orderedIds));
  setSession(req.params.id, newState);
  res.json(newState);
});

router.post('/sessions/:id/plug', async (req, res) => {
  const { on } = req.body as { on: boolean };
  if (typeof on !== 'boolean') return res.status(400).json({ error: 'Invalid body' });
  if (on) {
    const state = getSession(req.params.id);
    if (state && !state.controllerJoined) {
      setSession(req.params.id, { ...state, controllerJoined: true });
    }
  }
  try {
    await controlPlug(on);
    res.json({ ok: true });
  } catch (err) {
    console.error('Tuya plug error', err);
    res.status(502).json({ error: 'Tuya API error' });
  }
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
