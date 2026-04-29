export type GameMode = 301 | 501;
export type Multiplier = 1 | 2 | 3;
export type GameStatus = 'setup' | 'playing' | 'finished';

export interface DartThrow {
  value: number;
  multiplier: Multiplier;
  points: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  dartsThrown: number;
}

export interface Turn {
  startScore: number;
  throws: DartThrow[];
}

export interface CompletedTurn {
  playerIndex: number;
  startScore: number;
  throws: DartThrow[];
  wasBust: boolean;
}

export interface GameState {
  sessionId: string;
  mode: GameMode;
  status: GameStatus;
  players: Player[];
  currentPlayerIndex: number;
  currentTurn: Turn;
  turnHistory: CompletedTurn[];
  winnerId?: string;
}
