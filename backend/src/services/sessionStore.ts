import type { GameState } from '../types/game';

const sessions = new Map<string, GameState>();

export function get(sessionId: string): GameState | undefined {
  return sessions.get(sessionId);
}

export function set(state: GameState): void {
  sessions.set(state.sessionId, state);
}

export function has(sessionId: string): boolean {
  return sessions.has(sessionId);
}
