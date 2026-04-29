import type { Response } from 'express';
import type { GameState } from '../types/game';

const clients = new Map<string, Set<Response>>();

export function subscribe(sessionId: string, res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!clients.has(sessionId)) {
    clients.set(sessionId, new Set());
  }
  clients.get(sessionId)!.add(res);

  res.on('close', () => {
    clients.get(sessionId)?.delete(res);
  });
}

export function broadcast(sessionId: string, state: GameState): void {
  const sessionClients = clients.get(sessionId);
  if (!sessionClients) return;
  const payload = `data: ${JSON.stringify(state)}\n\n`;
  sessionClients.forEach((res) => res.write(payload));
}
