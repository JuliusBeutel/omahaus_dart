import type { Response } from 'express';

const clients = new Map<string, Set<Response>>();

export function addClient(sessionId: string, res: Response): void {
  if (!clients.has(sessionId)) clients.set(sessionId, new Set());
  clients.get(sessionId)!.add(res);
}

export function removeClient(sessionId: string, res: Response): void {
  clients.get(sessionId)?.delete(res);
}

export function broadcast(sessionId: string, data: unknown): void {
  const sessionClients = clients.get(sessionId);
  if (!sessionClients) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of sessionClients) {
    res.write(payload);
  }
}
