import { FINAL_PROGRESS } from '../constants/board';
import { DEFAULT_PLAYERS, PLAYER_ORDER } from '../constants/players';
import {
  GameOptions,
  GameState,
  LobbyState,
  MatchStats,
  PerformanceMode,
  MoveHistoryEntry,
  PlayerColor,
  PlayerStats,
  Token,
  UndoSnapshot,
} from '../types/game';
import { createId } from './helpers';

export const DEFAULT_OPTIONS: GameOptions = {
  autoMoveSingle: true,
  performanceMode: 'off',
  showHints: true,
  turnTimerSeconds: 0,
  soundsEnabled: true,
  manualDiceInput: false,
};

const createEmptyPlayerStats = (): PlayerStats => ({
  turns: 0,
  rolls: 0,
  sixes: 0,
  moves: 0,
  captures: 0,
  finishes: 0,
  wins: 0,
});

export const createInitialStats = (): MatchStats => ({
  red: createEmptyPlayerStats(),
  green: createEmptyPlayerStats(),
  yellow: createEmptyPlayerStats(),
  blue: createEmptyPlayerStats(),
});

export const isPerformanceModeOn = (mode: PerformanceMode) => mode !== 'off';

export const isUltraPerformanceMode = (mode: PerformanceMode) => mode === 'ultra';

export const createInitialTokens = () =>
  PLAYER_ORDER.flatMap((owner) =>
    Array.from({ length: 4 }, (_, index): Token => ({
      id: `${owner}-${index}`,
      owner,
      state: 'home',
      progress: null,
    })),
  );


export const isPlayerEnabledForCount = (color: PlayerColor, count: 2 | 3 | 4) => {
  if (count === 2) {
    return color === 'red' || color === 'yellow';
  }

  if (count === 3) {
    return color !== 'blue';
  }

  return true;
};

export const createInitialLobby = (): LobbyState => ({
  playerCount: 2,
  players: DEFAULT_PLAYERS.map((player) => ({ ...player, enabled: isPlayerEnabledForCount(player.color, 2) })),
  options: DEFAULT_OPTIONS,
});

export const createHistoryEntry = (
  player: PlayerColor,
  turn: number,
  type: MoveHistoryEntry['type'],
  message: string,
  diceValue?: number,
): MoveHistoryEntry => ({
  id: createId('history'),
  turn,
  player,
  type,
  message,
  diceValue,
  timestamp: Date.now(),
});

export const createInitialState = (): GameState => ({
  phase: 'setup',
  lobby: createInitialLobby(),
  players: DEFAULT_PLAYERS.map((player) => ({ ...player, enabled: isPlayerEnabledForCount(player.color, 2) })),
  tokens: createInitialTokens(),
  currentTurnIndex: 0,
  turnCount: 1,
  diceValue: null,
  diceRolling: false,
  selectableTokenIds: [],
  winner: null,
  moveHistory: [],
  showRules: false,
  showResetConfirm: false,
  pendingExtraTurn: false,
  canResumeSavedGame: false,
  theme: 'dark',
  options: DEFAULT_OPTIONS,
  stats: createInitialStats(),
  undoStack: [],
  lastActionAt: Date.now(),
});

export const getEnabledPlayers = (players: GameState['players']) => players.filter((player) => player.enabled);

export const getCurrentPlayer = (state: GameState) => getEnabledPlayers(state.players)[state.currentTurnIndex];

export const getNextTurnIndex = (state: GameState) => {
  const enabledPlayers = getEnabledPlayers(state.players);
  if (enabledPlayers.length === 0) {
    return 0;
  }

  return (state.currentTurnIndex + 1) % enabledPlayers.length;
};

export const isWinningPlayer = (tokens: Token[], player: PlayerColor) =>
  tokens.filter((token) => token.owner === player && token.progress === FINAL_PROGRESS).length === 4;

export const createUndoSnapshot = (state: GameState): UndoSnapshot => ({
  players: state.players.map((player) => ({ ...player })),
  tokens: state.tokens.map((token) => ({ ...token })),
  currentTurnIndex: state.currentTurnIndex,
  turnCount: state.turnCount,
  diceValue: state.diceValue,
  selectableTokenIds: [...state.selectableTokenIds],
  winner: state.winner,
  phase: state.phase,
  pendingExtraTurn: state.pendingExtraTurn,
  moveHistory: state.moveHistory.map((entry) => ({ ...entry })),
  stats: {
    red: { ...state.stats.red },
    green: { ...state.stats.green },
    yellow: { ...state.stats.yellow },
    blue: { ...state.stats.blue },
  },
});

