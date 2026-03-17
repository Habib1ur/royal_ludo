import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { FINAL_PROGRESS } from '../constants/board';
import { DEFAULT_PLAYERS } from '../constants/players';
import { GameOptions, GameState, PlayerColor, PlayerConfig, ToastMessage } from '../types/game';
import { canMoveToken, getCaptureCandidates } from '../utils/board';
import {
  createHistoryEntry,
  createInitialState,
  createInitialTokens,
  createUndoSnapshot,
  getCurrentPlayer,
  getNextTurnIndex,
  isPlayerEnabledForCount,
  isWinningPlayer,
} from '../utils/game';
import { createId, delay, rollSecureDie } from '../utils/helpers';

type StartPayload = {
  playerCount: 2 | 3 | 4;
  players: PlayerConfig[];
  options: GameOptions;
};

type GameActions = {
  setLobbyPlayerCount: (count: 2 | 3 | 4) => void;
  updateLobbyPlayer: (color: PlayerColor, patch: Partial<PlayerConfig>) => void;
  updateLobbyOptions: (patch: Partial<GameOptions>) => void;
  startGame: (payload: StartPayload) => void;
  rollDice: () => Promise<void>;
  useManualDice: (value: number) => Promise<void>;
  moveToken: (tokenId: string) => Promise<void>;
  advanceTurn: (reason?: 'extra-turn') => void;
  undoLastTurn: () => void;
  dismissToast: (id: string) => void;
  openRules: () => void;
  closeRules: () => void;
  openResetConfirm: () => void;
  closeResetConfirm: () => void;
  resetToLobby: () => void;
  clearSavedGame: () => void;
  resumeSavedGame: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
};

const buildToast = (title: string, description: string, tone: ToastMessage['tone']): ToastMessage => ({
  id: createId('toast'),
  title,
  description,
  tone,
});

const getMoveAnimationDelay = (steps: number, performanceMode: boolean, capturedCount: number) => {
  const perStep = performanceMode ? 280 : 400;
  const base = performanceMode ? 380 : 560;
  return base + steps * perStep + capturedCount * (performanceMode ? 650 : 1100);
};

const resolveDiceValue = async (setState: any, getState: any, diceValue: number, source: 'roll' | 'manual') => {
  const activeState = getState();
  const currentPlayer = getCurrentPlayer(activeState);
  const selectableTokenIds = activeState.tokens
    .filter((token: any) => token.owner === currentPlayer.color)
    .filter((token: any) => canMoveToken(token, diceValue))
    .map((token: any) => token.id);

  setState((current: any) => {
    const verb = source === 'manual' ? 'entered' : 'rolled';
    const nextHistory = [
      createHistoryEntry(
        currentPlayer.color,
        current.turnCount,
        'roll',
        `${currentPlayer.name} ${verb} a ${diceValue}.`,
        diceValue,
      ),
      ...current.moveHistory,
    ];

    const nextToasts = [...current.notifications];
    if (selectableTokenIds.length === 0) {
      nextHistory.unshift(
        createHistoryEntry(
          currentPlayer.color,
          current.turnCount,
          'pass',
          `${currentPlayer.name} had no legal move.`,
          diceValue,
        ),
      );
      nextToasts.unshift(buildToast('No legal move', `${currentPlayer.name} passes automatically.`, 'warning'));
    }

    return {
      ...current,
      diceRolling: false,
      diceValue,
      selectableTokenIds,
      moveHistory: nextHistory,
      notifications: nextToasts,
      stats: {
        ...current.stats,
        [currentPlayer.color]: {
          ...current.stats[currentPlayer.color],
          rolls: current.stats[currentPlayer.color].rolls + 1,
          sixes: current.stats[currentPlayer.color].sixes + (diceValue === 6 ? 1 : 0),
        },
      },
      lastActionAt: Date.now(),
    };
  });

  if (selectableTokenIds.length === 0) {
    await delay(activeState.options.performanceMode ? 700 : 1150);
    getState().advanceTurn();
  } else if (selectableTokenIds.length === 1 && activeState.options.autoMoveSingle) {
    await delay(activeState.options.performanceMode ? 1400 : 1900);
    const latest = getState();
    if (latest.phase === 'playing' && latest.diceValue !== null && latest.selectableTokenIds.includes(selectableTokenIds[0])) {
      await latest.moveToken(selectableTokenIds[0]);
    }
  }
};

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      setLobbyPlayerCount: (count) =>
        set((state) => ({
          lobby: {
            ...state.lobby,
            playerCount: count,
            players: state.lobby.players.map((player) => ({
              ...player,
              enabled: isPlayerEnabledForCount(player.color, count),
            })),
          },
        })),

      updateLobbyPlayer: (color, patch) =>
        set((state) => ({
          lobby: {
            ...state.lobby,
            players: state.lobby.players.map((player) =>
              player.color === color ? { ...player, ...patch } : player,
            ),
          },
        })),

      updateLobbyOptions: (patch) =>
        set((state) => ({
          lobby: {
            ...state.lobby,
            options: {
              ...state.lobby.options,
              ...patch,
            },
          },
        })),

      startGame: ({ playerCount, players, options }) =>
        set((state) => {
          const nextPlayers = players.map((player) => ({
            ...player,
            enabled: isPlayerEnabledForCount(player.color, playerCount),
          }));

          return {
            ...createInitialState(),
            phase: 'playing',
            players: nextPlayers,
            lobby: {
              playerCount,
              players: nextPlayers,
              options,
            },
            options,
            tokens: createInitialTokens(),
            moveHistory: [createHistoryEntry('red', 1, 'load', 'Fresh match started. The race begins.')],
            canResumeSavedGame: true,
            theme: state.theme,
            lastActionAt: Date.now(),
          };
        }),

      rollDice: async () => {
        const state = get();
        if (state.phase !== 'playing' || state.diceRolling || state.diceValue !== null || state.winner) {
          return;
        }

        set((current) => ({
          diceRolling: true,
          undoStack: [...current.undoStack, createUndoSnapshot(current)].slice(-20),
        }));
        await delay(state.options.performanceMode ? 540 : 980);

        const diceValue = rollSecureDie();
        await resolveDiceValue(set, get, diceValue, 'roll');
      },

      useManualDice: async (value) => {
        const state = get();
        if (state.phase !== 'playing' || state.diceRolling || state.diceValue !== null || state.winner) {
          return;
        }

        if (!Number.isInteger(value) || value < 1 || value > 6) {
          return;
        }

        set((current) => ({
          diceRolling: true,
          undoStack: [...current.undoStack, createUndoSnapshot(current)].slice(-20),
        }));
        await delay(state.options.performanceMode ? 720 : 1050);
        await resolveDiceValue(set, get, value, 'manual');
      },

      moveToken: async (tokenId) => {
        const state = get();
        if (state.phase !== 'playing' || state.diceValue === null || !state.selectableTokenIds.includes(tokenId)) {
          return;
        }

        const currentPlayer = getCurrentPlayer(state);
        const movedBy = state.diceValue;
        const selectedToken = state.tokens.find((token) => token.id === tokenId)!;
        const previousProgress = selectedToken.state === 'home' ? -1 : selectedToken.progress ?? 0;
        const movedTokens = state.tokens.map((token) => {
          if (token.id !== tokenId) {
            return token;
          }

          if (token.state === 'home') {
            return { ...token, state: 'active' as const, progress: 0 };
          }

          const nextProgress = (token.progress ?? 0) + movedBy;
          return {
            ...token,
            state: nextProgress === FINAL_PROGRESS ? ('finished' as const) : ('active' as const),
            progress: nextProgress,
          };
        });

        const movedToken = movedTokens.find((token) => token.id === tokenId)!;
        const capturedTokens = getCaptureCandidates(movedToken, movedTokens);
        const resolvedTokens = movedTokens.map((token) =>
          capturedTokens.some((captured) => captured.id === token.id)
            ? { ...token, state: 'home' as const, progress: null }
            : token,
        );
        const won = isWinningPlayer(resolvedTokens, currentPlayer.color);
        const stepsTravelled = Math.max(1, (movedToken.progress ?? 0) - previousProgress);
        const finishGained = movedTokens.filter((token) => token.owner === currentPlayer.color && token.state === 'finished').length -
          state.tokens.filter((token) => token.owner === currentPlayer.color && token.state === 'finished').length;
        const reachedFinish = finishGained > 0;
        const extraTurn = movedBy === 6 || capturedTokens.length > 0 || reachedFinish;

        set((current) => ({
          ...current,
          tokens: movedTokens,
          diceValue: null,
          diceRolling: true,
          selectableTokenIds: [],
          pendingExtraTurn: false,
          moveHistory: [
            createHistoryEntry(
              currentPlayer.color,
              current.turnCount,
              'move',
              `${currentPlayer.name} moved token ${Number(tokenId.split('-')[1]) + 1} by ${movedBy}.`,
              movedBy,
            ),
            ...current.moveHistory,
          ],
          stats: {
            ...current.stats,
            [currentPlayer.color]: {
              ...current.stats[currentPlayer.color],
              moves: current.stats[currentPlayer.color].moves + 1,
              finishes: current.stats[currentPlayer.color].finishes + Math.max(0, finishGained),
            },
          },
          lastActionAt: Date.now(),
        }));

        await delay(getMoveAnimationDelay(stepsTravelled, state.options.performanceMode, 0));

        if (capturedTokens.length > 0) {
          set((current) => ({
            ...current,
            tokens: resolvedTokens,
            moveHistory: [
              ...capturedTokens.map((captured) =>
                createHistoryEntry(
                  currentPlayer.color,
                  current.turnCount,
                  'capture',
                  `${currentPlayer.name} captured ${captured.owner}'s token.`,
                ),
              ),
              ...current.moveHistory,
            ],
            notifications: [
              buildToast(
                'Capture',
                `${currentPlayer.name} sent ${capturedTokens.length} token${capturedTokens.length > 1 ? 's' : ''} home.`,
                'success',
              ),
              ...current.notifications,
            ],
            stats: {
              ...current.stats,
              [currentPlayer.color]: {
                ...current.stats[currentPlayer.color],
                captures: current.stats[currentPlayer.color].captures + capturedTokens.length,
              },
            },
            lastActionAt: Date.now(),
          }));

          await delay(state.options.performanceMode ? 220 : 380);
        }

        if (won) {
          set((current) => ({
            ...current,
            winner: currentPlayer.color,
            phase: 'finished',
            diceRolling: false,
            moveHistory: [
              createHistoryEntry(
                currentPlayer.color,
                current.turnCount,
                'win',
                `${currentPlayer.name} finished all four tokens and won the match.`,
              ),
              ...current.moveHistory,
            ],
            notifications: [buildToast('Winner', `${currentPlayer.name} owns the board.`, 'success'), ...current.notifications],
            stats: {
              ...current.stats,
              [currentPlayer.color]: {
                ...current.stats[currentPlayer.color],
                wins: current.stats[currentPlayer.color].wins + 1,
              },
            },
            lastActionAt: Date.now(),
          }));
          return;
        }

        if (extraTurn) {
          set((current) => ({
            ...current,
            pendingExtraTurn: true,
            notifications: [buildToast('Extra turn', `${currentPlayer.name} rolled a 6 and goes again.`, 'info'), ...current.notifications],
            lastActionAt: Date.now(),
          }));
        }

        set({ diceRolling: false });
        get().advanceTurn(extraTurn ? 'extra-turn' : undefined);
      },

      advanceTurn: (reason) =>
        set((state) => {
          if (state.phase !== 'playing') {
            return state;
          }

          const currentPlayer = getCurrentPlayer(state);
          if (reason === 'extra-turn' || state.pendingExtraTurn) {
            return {
              ...state,
              pendingExtraTurn: false,
              diceValue: null,
              selectableTokenIds: [],
              stats: {
                ...state.stats,
                [currentPlayer.color]: {
                  ...state.stats[currentPlayer.color],
                  turns: state.stats[currentPlayer.color].turns + 1,
                },
              },
              lastActionAt: Date.now(),
            };
          }

          return {
            ...state,
            currentTurnIndex: getNextTurnIndex(state),
            turnCount: state.turnCount + 1,
            diceValue: null,
            selectableTokenIds: [],
            pendingExtraTurn: false,
            stats: {
              ...state.stats,
              [currentPlayer.color]: {
                ...state.stats[currentPlayer.color],
                turns: state.stats[currentPlayer.color].turns + 1,
              },
            },
            lastActionAt: Date.now(),
          };
        }),

      undoLastTurn: () =>
        set((state) => {
          const snapshot = state.undoStack[state.undoStack.length - 1];
          if (!snapshot) {
            return state;
          }

          return {
            ...state,
            ...snapshot,
            notifications: [buildToast('Undo', 'Reverted the last turn.', 'info'), ...state.notifications],
            undoStack: state.undoStack.slice(0, -1),
            diceRolling: false,
            showRules: false,
            showResetConfirm: false,
            lastActionAt: Date.now(),
          };
        }),

      dismissToast: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((toast) => toast.id !== id),
        })),

      openRules: () => set({ showRules: true }),
      closeRules: () => set({ showRules: false }),
      openResetConfirm: () => set({ showResetConfirm: true }),
      closeResetConfirm: () => set({ showResetConfirm: false }),

      resetToLobby: () =>
        set((state) => ({
          ...createInitialState(),
          lobby: state.lobby,
          theme: state.theme,
        })),

      clearSavedGame: () => {
        localStorage.removeItem('royal-ludo-storage');
        set((state) => ({
          ...createInitialState(),
          lobby: state.lobby,
          theme: state.theme,
        }));
      },

      resumeSavedGame: () =>
        set((state) => ({
          phase: state.winner ? 'finished' : 'playing',
        })),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'royal-ludo-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ...state,
        notifications: [],
        diceRolling: false,
        showRules: false,
        showResetConfirm: false,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        state.canResumeSavedGame = state.phase === 'playing' || state.phase === 'finished';
        if (!state.players?.length) {
          state.players = DEFAULT_PLAYERS;
        }
        if (!state.lobby?.players?.length) {
          state.lobby = {
            playerCount: 2,
            players: DEFAULT_PLAYERS,
            options: state.options,
          };
        }
        if (!state.options) {
          state.options = state.lobby?.options ?? {
            autoMoveSingle: true,
            performanceMode: false,
            showHints: true,
            turnTimerSeconds: 0,
            soundsEnabled: true,
            manualDiceInput: false,
          };
        }
        if (!state.lobby.options) {
          state.lobby.options = state.options;
        }
        if (!state.stats) {
          state.stats = createInitialState().stats;
        }
        if (!state.undoStack) {
          state.undoStack = [];
        }
        if (!state.lastActionAt) {
          state.lastActionAt = Date.now();
        }
      },
    },
  ),
);
