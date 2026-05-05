import { v4 as uuidv4 } from 'uuid';
import type { GameState, GameMode, Multiplier, DartThrow, Player } from './types.js';

export function createGame(sessionId: string): GameState {
  return {
    sessionId,
    mode: 501,
    status: 'setup',
    players: [],
    currentPlayerIndex: 0,
    currentTurn: { startScore: 501, throws: [] },
    turnHistory: [],
    lastActivity: Date.now(),
  };
}

export function setMode(state: GameState, mode: GameMode): GameState {
  if (state.status !== 'setup') return state;
  return { ...state, mode };
}

export function addPlayer(state: GameState, name: string): GameState {
  if (state.status !== 'setup') return state;
  if (state.players.length >= 4) return state;
  const player: Player = {
    id: uuidv4(),
    name: name.trim(),
    score: state.mode,
    dartsThrown: 0,
  };
  return { ...state, players: [...state.players, player] };
}

export function removePlayer(state: GameState, playerId: string): GameState {
  if (state.status !== 'setup') return state;
  return { ...state, players: state.players.filter((p) => p.id !== playerId) };
}

export function reorderPlayers(state: GameState, orderedIds: string[]): GameState {
  if (state.status !== 'setup') return state;
  const reordered = orderedIds
    .map((id) => state.players.find((p) => p.id === id))
    .filter((p): p is Player => p !== undefined);
  return { ...state, players: reordered };
}

export function startGame(state: GameState): GameState {
  if (state.status !== 'setup' || state.players.length < 1) return state;
  const players = state.players.map((p) => ({ ...p, score: state.mode, dartsThrown: 0 }));
  return {
    ...state,
    status: 'playing',
    players,
    currentPlayerIndex: 0,
    currentTurn: { startScore: state.mode, throws: [] },
    turnHistory: [],
    winnerId: undefined,
  };
}

export function processThrow(state: GameState, value: number, multiplier: Multiplier): GameState {
  if (state.status !== 'playing') return state;

  const points = value * multiplier;
  const playerIndex = state.currentPlayerIndex;
  const player = state.players[playerIndex];
  const newScore = player.score - points;

  const dartThrow: DartThrow = { value, multiplier, points };
  const updatedThrows = [...state.currentTurn.throws, dartThrow];

  const isBust =
    newScore < 0 ||
    newScore === 1 ||
    (newScore === 0 && multiplier !== 2);

  const isWin = newScore === 0 && multiplier === 2;

  if (isBust) {
    const completedTurn = {
      playerIndex,
      startScore: state.currentTurn.startScore,
      throws: updatedThrows,
      wasBust: true,
    };
    const nextPlayerIndex = (playerIndex + 1) % state.players.length;
    const nextStartScore = state.players[nextPlayerIndex].score;
    return {
      ...state,
      players: state.players.map((p, i) =>
        i === playerIndex ? { ...p, score: state.currentTurn.startScore, dartsThrown: p.dartsThrown + 1 } : p
      ),
      currentPlayerIndex: nextPlayerIndex,
      currentTurn: { startScore: nextStartScore, throws: [] },
      turnHistory: [...state.turnHistory, completedTurn],
    };
  }

  if (isWin) {
    const completedTurn = {
      playerIndex,
      startScore: state.currentTurn.startScore,
      throws: updatedThrows,
      wasBust: false,
    };
    return {
      ...state,
      status: 'finished',
      winnerId: player.id,
      players: state.players.map((p, i) =>
        i === playerIndex
          ? { ...p, score: 0, dartsThrown: p.dartsThrown + 1 }
          : p
      ),
      currentTurn: { startScore: 0, throws: updatedThrows },
      turnHistory: [...state.turnHistory, completedTurn],
    };
  }

  const updatedPlayers = state.players.map((p, i) =>
    i === playerIndex
      ? { ...p, score: newScore, dartsThrown: p.dartsThrown + 1 }
      : p
  );

  const currentTurnUpdated = { ...state.currentTurn, throws: updatedThrows };

  if (updatedThrows.length === 3) {
    const completedTurn = {
      playerIndex,
      startScore: state.currentTurn.startScore,
      throws: updatedThrows,
      wasBust: false,
    };
    const nextPlayerIndex = (playerIndex + 1) % state.players.length;
    const nextStartScore = updatedPlayers[nextPlayerIndex].score;
    return {
      ...state,
      players: updatedPlayers,
      currentPlayerIndex: nextPlayerIndex,
      currentTurn: { startScore: nextStartScore, throws: [] },
      turnHistory: [...state.turnHistory, completedTurn],
    };
  }

  return {
    ...state,
    players: updatedPlayers,
    currentTurn: currentTurnUpdated,
  };
}

export function undoLastThrow(state: GameState): GameState {
  if (state.status === 'setup') return state;

  if (state.currentTurn.throws.length > 0) {
    const throws = state.currentTurn.throws.slice(0, -1);
    const lastThrow = state.currentTurn.throws[state.currentTurn.throws.length - 1];
    const playerIndex = state.currentPlayerIndex;
    return {
      ...state,
      players: state.players.map((p, i) =>
        i === playerIndex
          ? { ...p, score: p.score + lastThrow.points, dartsThrown: p.dartsThrown - 1 }
          : p
      ),
      currentTurn: { ...state.currentTurn, throws },
    };
  }

  if (state.turnHistory.length === 0) return state;

  const prevTurn = state.turnHistory[state.turnHistory.length - 1];
  const newHistory = state.turnHistory.slice(0, -1);
  const prevPlayerIndex = prevTurn.playerIndex;
  const throwsWithoutLast = prevTurn.throws.slice(0, -1);

  const scoreAfterRestore =
    prevTurn.startScore - throwsWithoutLast.reduce((sum, t) => sum + t.points, 0);

  const dartsToRestore = prevTurn.throws.length - 1;
  const prevDartsThrown = state.players[prevPlayerIndex].dartsThrown - prevTurn.throws.length + dartsToRestore;

  const restoredPlayers = state.players.map((p, i) => {
    if (i !== prevPlayerIndex) return p;
    return {
      ...p,
      score: scoreAfterRestore,
      dartsThrown: Math.max(0, prevDartsThrown),
    };
  });

  return {
    ...state,
    status: 'playing',
    winnerId: undefined,
    players: restoredPlayers,
    currentPlayerIndex: prevPlayerIndex,
    currentTurn: { startScore: prevTurn.startScore, throws: throwsWithoutLast },
    turnHistory: newHistory,
  };
}

export function resetGame(state: GameState): GameState {
  const players = state.players.map((p) => ({ ...p, score: state.mode, dartsThrown: 0 }));
  const startScore = players[0]?.score ?? state.mode;
  return {
    ...state,
    status: 'setup',
    players,
    currentPlayerIndex: 0,
    currentTurn: { startScore, throws: [] },
    turnHistory: [],
    winnerId: undefined,
  };
}

export function formatThrowLabel(dartThrow: DartThrow): string {
  if (dartThrow.multiplier === 2) return `D${dartThrow.value}`;
  if (dartThrow.multiplier === 3) return `T${dartThrow.value}`;
  return `${dartThrow.value}`;
}
