import type { GameState } from '../types/game';

const store = new Map<string, GameState>();

export function getSession(id: string): GameState | undefined {
  return store.get(id);
}

export function setSession(id: string, state: GameState): void {
  store.set(id, state);
}

export function deleteSession(id: string): void {
  store.delete(id);
}
