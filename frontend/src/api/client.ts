import type { GameMode, Multiplier } from '../types/game';

const BASE = '/api/sessions';

async function post(url: string, body?: object): Promise<unknown> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function patch(url: string, body: object): Promise<unknown> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function del(url: string): Promise<unknown> {
  const res = await fetch(url, { method: 'DELETE' });
  return res.json();
}

export async function createSession(): Promise<{ sessionId: string }> {
  return post(BASE) as Promise<{ sessionId: string }>;
}

export async function addPlayer(sessionId: string, name: string): Promise<void> {
  await post(`${BASE}/${sessionId}/players`, { name });
}

export async function removePlayer(sessionId: string, playerId: string): Promise<void> {
  await del(`${BASE}/${sessionId}/players/${playerId}`);
}

export async function setMode(sessionId: string, mode: GameMode): Promise<void> {
  await patch(`${BASE}/${sessionId}/mode`, { mode });
}

export async function startGame(sessionId: string): Promise<void> {
  await post(`${BASE}/${sessionId}/start`);
}

export async function throwDart(sessionId: string, value: number, multiplier: Multiplier): Promise<void> {
  await post(`${BASE}/${sessionId}/throw`, { value, multiplier });
}

export async function undoThrow(sessionId: string): Promise<void> {
  await post(`${BASE}/${sessionId}/undo`);
}

export async function resetGame(sessionId: string): Promise<void> {
  await post(`${BASE}/${sessionId}/reset`);
}
