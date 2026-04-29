import { v4 as uuidv4 } from 'uuid';
import type { GameState, GameMode, Multiplier, DartThrow, Player } from '../types/game';

export function createSession(sessionId: string): GameState {
  return {
    sessionId,
    mode: 501,
    status: 'setup',
    players: [],
    currentPlayerIndex: 0,
    currentTurn: { startScore: 0, throws: [] },
  };
}

export function addPlayer(state: GameState, name: string): GameState {
  if (state.players.length >= 4) return state;
  const player: Player = { id: uuidv4(), name, score: 0, dartsThrown: 0 };
  return { ...state, players: [...state.players, player] };
}

export function removePlayer(state: GameState, playerId: string): GameState {
  return { ...state, players: state.players.filter((p) => p.id !== playerId) };
}

export function setMode(state: GameState, mode: GameMode): GameState {
  return { ...state, mode };
}

export function startGame(state: GameState): GameState {
  if (state.players.length === 0) return state;
  const players = state.players.map((p) => ({ ...p, score: state.mode, dartsThrown: 0 }));
  return {
    ...state,
    status: 'playing',
    players,
    currentPlayerIndex: 0,
    currentTurn: { startScore: state.mode, throws: [] },
  };
}

function advanceToNextPlayer(state: GameState): GameState {
  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
  const nextScore = state.players[nextIndex].score;
  return {
    ...state,
    currentPlayerIndex: nextIndex,
    currentTurn: { startScore: nextScore, throws: [] },
  };
}

export function applyThrow(state: GameState, value: number, multiplier: Multiplier): GameState {
  const playerIndex = state.currentPlayerIndex;
  const player = state.players[playerIndex];
  const points = value * multiplier;
  const newScore = player.score - points;

  const isBust = newScore < 0 || newScore === 1 || (newScore === 0 && multiplier !== 2);

  if (isBust) {
    const players = state.players.map((p, i) =>
      i === playerIndex ? { ...p, score: state.currentTurn.startScore } : p
    );
    return advanceToNextPlayer({ ...state, players });
  }

  const dartThrow: DartThrow = { value, multiplier, points };
  const players = state.players.map((p, i) =>
    i === playerIndex ? { ...p, score: newScore, dartsThrown: p.dartsThrown + 1 } : p
  );
  const newThrows = [...state.currentTurn.throws, dartThrow];

  if (newScore === 0 && multiplier === 2) {
    return {
      ...state,
      players,
      status: 'finished',
      winnerId: player.id,
      currentTurn: { ...state.currentTurn, throws: newThrows },
    };
  }

  const next = { ...state, players, currentTurn: { ...state.currentTurn, throws: newThrows } };
  return newThrows.length >= 3 ? advanceToNextPlayer(next) : next;
}

export function undoLastThrow(state: GameState): GameState {
  const { throws } = state.currentTurn;
  if (throws.length === 0) return state;

  const lastThrow = throws[throws.length - 1];
  const playerIndex = state.currentPlayerIndex;
  const players = state.players.map((p, i) =>
    i === playerIndex
      ? { ...p, score: p.score + lastThrow.points, dartsThrown: Math.max(0, p.dartsThrown - 1) }
      : p
  );

  return {
    ...state,
    players,
    currentTurn: { ...state.currentTurn, throws: throws.slice(0, -1) },
  };
}

export function resetGame(state: GameState): GameState {
  const players = state.players.map((p) => ({ ...p, score: 0, dartsThrown: 0 }));
  return {
    ...state,
    status: 'setup',
    players,
    currentPlayerIndex: 0,
    currentTurn: { startScore: 0, throws: [] },
    winnerId: undefined,
  };
}
