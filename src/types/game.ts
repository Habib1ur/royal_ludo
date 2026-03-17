export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type TokenState = 'home' | 'active' | 'finished';

export type GamePhase = 'setup' | 'playing' | 'finished';

export type BoardCoordinate = {
  row: number;
  col: number;
};

export type PlayerKind = 'human' | 'ai';

export type GameOptions = {
  autoMoveSingle: boolean;
  performanceMode: boolean;
  showHints: boolean;
  turnTimerSeconds: 0 | 15 | 30;
  soundsEnabled: boolean;
  manualDiceInput: boolean;
};

export type PlayerConfig = {
  color: PlayerColor;
  name: string;
  enabled: boolean;
  avatar: string;
  kind: PlayerKind;
};

export type Token = {
  id: string;
  owner: PlayerColor;
  state: TokenState;
  progress: number | null;
};

export type MoveHistoryEntry = {
  id: string;
  turn: number;
  player: PlayerColor;
  type: 'roll' | 'move' | 'capture' | 'pass' | 'win' | 'load' | 'undo' | 'timer';
  message: string;
  diceValue?: number;
  timestamp: number;
};

export type NotificationTone = 'info' | 'success' | 'warning';

export type ToastMessage = {
  id: string;
  title: string;
  description: string;
  tone: NotificationTone;
};

export type PlayerStats = {
  turns: number;
  rolls: number;
  sixes: number;
  moves: number;
  captures: number;
  finishes: number;
  wins: number;
};

export type MatchStats = Record<PlayerColor, PlayerStats>;

export type UndoSnapshot = {
  players: PlayerConfig[];
  tokens: Token[];
  currentTurnIndex: number;
  turnCount: number;
  diceValue: number | null;
  selectableTokenIds: string[];
  winner: PlayerColor | null;
  phase: GamePhase;
  pendingExtraTurn: boolean;
  moveHistory: MoveHistoryEntry[];
  stats: MatchStats;
};

export type LobbyState = {
  playerCount: 2 | 3 | 4;
  players: PlayerConfig[];
  options: GameOptions;
};

export type GameState = {
  phase: GamePhase;
  lobby: LobbyState;
  players: PlayerConfig[];
  tokens: Token[];
  currentTurnIndex: number;
  turnCount: number;
  diceValue: number | null;
  diceRolling: boolean;
  selectableTokenIds: string[];
  winner: PlayerColor | null;
  moveHistory: MoveHistoryEntry[];
  notifications: ToastMessage[];
  showRules: boolean;
  showResetConfirm: boolean;
  pendingExtraTurn: boolean;
  canResumeSavedGame: boolean;
  theme: 'dark' | 'light';
  options: GameOptions;
  stats: MatchStats;
  undoStack: UndoSnapshot[];
  lastActionAt: number;
};
