import { v4 as uuidv4 } from 'uuid';
import type { GameState, GameMode, Multiplier, DartThrow, Player, CompletedTurn } from '../types/game';

export function createSession(sessionId: string): GameState {
  return {
    sessionId,
    mode: 501,
    status: 'setup',
    players: [],
    currentPlayerIndex: 0,
    currentTurn: { startScore: 0, throws: [] },
    turnHistory: [],
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
    turnHistory: [],
  };
}

function advanceToNextPlayer(state: GameState, wasBust: boolean): GameState {
  const completed: CompletedTurn = {
    playerIndex: state.currentPlayerIndex,
    startScore: state.currentTurn.startScore,
    throws: state.currentTurn.throws,
    wasBust,
  };
  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
  return {
    ...state,
    currentPlayerIndex: nextIndex,
    currentTurn: { startScore: state.players[nextIndex].score, throws: [] },
    turnHistory: [...state.turnHistory, completed],
  };
}

export function applyThrow(state: GameState, value: number, multiplier: Multiplier): GameState {
  const playerIndex = state.currentPlayerIndex;
  const player = state.players[playerIndex];
  const points = value * multiplier;
  const newScore = player.score - points;

  const isBust = newScore < 0 || newScore === 1 || (newScore === 0 && multiplier !== 2);

  if (isBust) {
    const bustThrow: DartThrow = { value, multiplier, points };
    const players = state.players.map((p, i) =>
      i === playerIndex ? { ...p, score: state.currentTurn.startScore } : p
    );
    const stateWithBust = {
      ...state,
      players,
      currentTurn: { ...state.currentTurn, throws: [...state.currentTurn.throws, bustThrow] },
    };
    return advanceToNextPlayer(stateWithBust, true);
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
  return newThrows.length >= 3 ? advanceToNextPlayer(next, false) : next;
}

export function undoLastThrow(state: GameState): GameState {
  const { throws } = state.currentTurn;

  if (throws.length > 0) {
    const lastThrow = throws[throws.length - 1];
    const playerIndex = state.currentPlayerIndex;
    const players = state.players.map((p, i) =>
      i === playerIndex
        ? { ...p, score: p.score + lastThrow.points, dartsThrown: Math.max(0, p.dartsThrown - 1) }
        : p
    );
    return { ...state, players, currentTurn: { ...state.currentTurn, throws: throws.slice(0, -1) } };
  }

  if (state.turnHistory.length === 0) return state;

  const history = [...state.turnHistory];
  const prevTurn = history.pop()!;
  const prevThrows = prevTurn.throws;
  if (prevThrows.length === 0) return state;

  const lastThrow = prevThrows[prevThrows.length - 1];
  const remainingThrows = prevThrows.slice(0, -1);
  const prevPlayer = state.players[prevTurn.playerIndex];

  let restoredScore: number;
  let restoredDartsThrown: number;

  if (prevTurn.wasBust) {
    restoredScore = prevTurn.startScore - remainingThrows.reduce((s, t) => s + t.points, 0);
    restoredDartsThrown = prevPlayer.dartsThrown;
  } else {
    restoredScore = prevPlayer.score + lastThrow.points;
    restoredDartsThrown = Math.max(0, prevPlayer.dartsThrown - 1);
  }

  const players = state.players.map((p, i) =>
    i === prevTurn.playerIndex
      ? { ...p, score: restoredScore, dartsThrown: restoredDartsThrown }
      : p
  );

  return {
    ...state,
    players,
    currentPlayerIndex: prevTurn.playerIndex,
    currentTurn: { startScore: prevTurn.startScore, throws: remainingThrows },
    turnHistory: history,
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
    turnHistory: [],
    winnerId: undefined,
  };
}
