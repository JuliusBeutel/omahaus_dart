import type { GameState, GameMode, Multiplier } from '../types/game';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export async function createSession(): Promise<{ sessionId: string }> {
  return request('/api/sessions', { method: 'POST' });
}

export async function getSession(id: string): Promise<GameState> {
  return request(`/api/sessions/${id}`);
}

export async function postThrow(
  id: string,
  value: number,
  multiplier: Multiplier
): Promise<GameState> {
  return request(`/api/sessions/${id}/throw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value, multiplier }),
  });
}

export async function postUndo(id: string): Promise<GameState> {
  return request(`/api/sessions/${id}/undo`, { method: 'POST' });
}

export async function patchMode(id: string, mode: GameMode): Promise<GameState> {
  return request(`/api/sessions/${id}/mode`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
}

export async function postStart(id: string): Promise<GameState> {
  return request(`/api/sessions/${id}/start`, { method: 'POST' });
}

export async function postReset(id: string): Promise<GameState> {
  return request(`/api/sessions/${id}/reset`, { method: 'POST' });
}

export async function postPlayer(id: string, name: string): Promise<GameState> {
  return request(`/api/sessions/${id}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}

export async function deletePlayer(id: string, playerId: string): Promise<GameState> {
  return request(`/api/sessions/${id}/players/${playerId}`, { method: 'DELETE' });
}

export async function postReorder(id: string, orderedIds: string[]): Promise<GameState> {
  return request(`/api/sessions/${id}/players/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds }),
  });
}

export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) throw new Error(`API error ${res.status}`);
}

export async function postJoin(id: string): Promise<void> {
  await fetch(`/api/sessions/${id}/join`, { method: 'POST' });
}

export function parseApiError(err: unknown): string {
  if (err instanceof Error) {
    const match = err.message.match(/API error (\d+)/);
    if (match) {
      const code = parseInt(match[1]);
      const descriptions: Record<number, string> = {
        400: 'Ungültige Eingabe',
        404: 'Sitzung nicht gefunden',
        409: 'Aktion nicht möglich',
        500: 'Interner Serverfehler',
        502: 'Verbindungsfehler',
      };
      return `Fehler ${code} – ${descriptions[code] ?? 'Unbekannter Fehler'}`;
    }
  }
  return 'Unbekannter Fehler';
}

export async function postPlug(id: string, on: boolean): Promise<void> {
  await fetch(`/api/sessions/${id}/plug`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ on }),
  });
}
