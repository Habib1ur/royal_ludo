import { memo, useEffect, useMemo, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import type { CSSProperties } from 'react';
import {
  BOARD_SIZE,
  FINAL_PROGRESS,
  HOME_LANES,
  HOME_SLOTS,
  OUTER_PATH,
  OUTER_PATH_LENGTH,
  SAFE_INDICES,
  START_INDEX_BY_PLAYER,
  YARD_BOUNDS,
} from '../constants/board';
import { PLAYER_META, PLAYER_ORDER } from '../constants/players';
import { BoardCoordinate, PlayerColor, Token } from '../types/game';
import { getHomeSlotIndex, getTokenCoordinate, getTokenPathCoordinate } from '../utils/board';

type BoardProps = {
  tokens: Token[];
  playersEnabled: Record<PlayerColor, boolean>;
  selectableTokenIds: string[];
  onTokenSelect: (tokenId: string) => void;
  onStepSound?: () => void;
  compactMode?: boolean;
  lowPerformanceMode?: boolean;
};

type CellKind = 'yard' | 'track' | 'lane' | 'center' | 'empty';

type CellData = {
  key: string;
  row: number;
  col: number;
  kind: CellKind;
  player?: PlayerColor;
  safe?: boolean;
};

type PawnVars = CSSProperties & {
  '--pawn-start': string;
  '--pawn-mid': string;
  '--pawn-end': string;
  '--pawn-accent': string;
};

type RenderToken = {
  token: Token;
  coord: BoardCoordinate;
  offset: { x: number; y: number };
};

const FINISH_COORD: BoardCoordinate = { row: 7, col: 7 };
const CELL_PERCENT = 100 / BOARD_SIZE;
const SLOT_INSET = CELL_PERCENT * 0.18;
const SLOT_SIZE = CELL_PERCENT * 0.64;
const HOME_PANEL_INSET = CELL_PERCENT * 0.08;
const HOME_PANEL_SIZE = CELL_PERCENT * 5.84;
const coordKey = (coord: BoardCoordinate) => `${coord.row}-${coord.col}`;
const outerPathMap = new Map(OUTER_PATH.map((coord, index) => [coordKey(coord), index]));
const laneMap = new Map(
  Object.entries(HOME_LANES).flatMap(([player, coords]) =>
    coords.map((coord) => [coordKey(coord), player as PlayerColor]),
  ),
);
const startCells = PLAYER_ORDER.map((player) => ({ player, coord: OUTER_PATH[START_INDEX_BY_PLAYER[player]] }));
const startArrowOffset: Record<PlayerColor, { x: number; y: number; rotation: number }> = {
  red: { x: -6, y: 8, rotation: 0 },
  green: { x: -8, y: -6, rotation: 90 },
  yellow: { x: 6, y: -8, rotation: 180 },
  blue: { x: 8, y: 6, rotation: 270 },
};
const tokenOffsetsRegular = [
  { x: -10, y: -10 },
  { x: 10, y: -10 },
  { x: -10, y: 10 },
  { x: 10, y: 10 },
];
const tokenOffsetsCompact = [
  { x: -7, y: -7 },
  { x: 7, y: -7 },
  { x: -7, y: 7 },
  { x: 7, y: 7 },
];

const COMPACT_HOME_SLOTS: Record<PlayerColor, BoardCoordinate[]> = {
  red: [
    { row: 1.4, col: 1.4 },
    { row: 1.4, col: 3.6 },
    { row: 3.6, col: 1.4 },
    { row: 3.6, col: 3.6 },
  ],
  green: [
    { row: 1.4, col: 10.4 },
    { row: 1.4, col: 12.6 },
    { row: 3.6, col: 10.4 },
    { row: 3.6, col: 12.6 },
  ],
  yellow: [
    { row: 10.4, col: 10.4 },
    { row: 10.4, col: 12.6 },
    { row: 12.6, col: 10.4 },
    { row: 12.6, col: 12.6 },
  ],
  blue: [
    { row: 10.4, col: 1.4 },
    { row: 10.4, col: 3.6 },
    { row: 12.6, col: 1.4 },
    { row: 12.6, col: 3.6 },
  ],
};

const buildBoardCells = (): CellData[] => {
  const cells: CellData[] = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const key = `${row}-${col}`;
      const outerIndex = outerPathMap.get(key);
      const lanePlayer = laneMap.get(key);
      const inRedYard = row <= 5 && col <= 5;
      const inGreenYard = row <= 5 && col >= 9;
      const inYellowYard = row >= 9 && col >= 9;
      const inBlueYard = row >= 9 && col <= 5;

      if (row >= 6 && row <= 8 && col >= 6 && col <= 8) {
        cells.push({ key, row, col, kind: 'center' });
      } else if (outerIndex !== undefined) {
        cells.push({ key, row, col, kind: 'track', safe: SAFE_INDICES.includes(outerIndex) });
      } else if (lanePlayer) {
        cells.push({ key, row, col, kind: 'lane', player: lanePlayer });
      } else if (inRedYard || inGreenYard || inYellowYard || inBlueYard) {
        cells.push({
          key,
          row,
          col,
          kind: 'yard',
          player: inRedYard ? 'red' : inGreenYard ? 'green' : inYellowYard ? 'yellow' : 'blue',
        });
      } else {
        cells.push({ key, row, col, kind: 'empty' });
      }
    }
  }
  return cells;
};

const boardCells = buildBoardCells();

const getDisplayCoordinate = (token: Token, compactMode: boolean) => {
  const homeSlotIndex = getHomeSlotIndex(token.id);
  if (token.state === 'home' && compactMode) return COMPACT_HOME_SLOTS[token.owner][homeSlotIndex];
  return getTokenCoordinate(token, homeSlotIndex) ?? FINISH_COORD;
};

const getPositionStyle = (coord: BoardCoordinate) => ({
  left: `${((coord.col + 0.5) / BOARD_SIZE) * 100}%`,
  top: `${((coord.row + 0.5) / BOARD_SIZE) * 100}%`,
});

const buildSequence = (previous: Token | undefined, next: Token, compactMode: boolean): BoardCoordinate[] => {
  const homeSlotIndex = getHomeSlotIndex(next.id);
  const homeCoord = compactMode ? COMPACT_HOME_SLOTS[next.owner][homeSlotIndex] : HOME_SLOTS[next.owner][homeSlotIndex];
  if (!previous) return [getDisplayCoordinate(next, compactMode)];
  if (previous.state === 'home' && next.state === 'active' && next.progress === 0) {
    return [homeCoord, getTokenPathCoordinate(next, 0)];
  }
  if (
    previous.state !== 'home' &&
    previous.progress !== null &&
    next.state !== 'home' &&
    next.progress !== null &&
    next.progress >= previous.progress
  ) {
    const steps: BoardCoordinate[] = [];
    for (let progress = previous.progress + 1; progress <= next.progress; progress += 1) {
      steps.push(progress === FINAL_PROGRESS ? FINISH_COORD : getTokenPathCoordinate(next, progress));
    }
    return steps.length > 0 ? steps : [getDisplayCoordinate(next, compactMode)];
  }
  if (previous.state === 'active' && previous.progress !== null && next.state === 'home') {
    const steps: BoardCoordinate[] = [];
    for (let progress = previous.progress - 1; progress >= 0; progress -= 1) {
      if (progress < OUTER_PATH_LENGTH) {
        steps.push(getTokenPathCoordinate(previous, progress));
      }
    }
    steps.push(homeCoord);
    return steps;
  }
  if (previous.state !== 'home' && next.state === 'home') return [homeCoord];
  return [getDisplayCoordinate(next, compactMode)];
};

const PawnToken = memo(function PawnToken({
  token,
  targetCoord,
  offset,
  selectable,
  compactMode,
  lowPerformanceMode,
  onTokenSelect,
  onStepSound,
}: {
  token: Token;
  targetCoord: BoardCoordinate;
  offset: { x: number; y: number };
  selectable: boolean;
  compactMode: boolean;
  lowPerformanceMode: boolean;
  onTokenSelect: (tokenId: string) => void;
  onStepSound?: () => void;
}) {
  const metaForToken = PLAYER_META[token.owner];
  const pawnStyle: PawnVars = {
    '--pawn-start': '#ffffff',
    '--pawn-mid': metaForToken.soft,
    '--pawn-end': metaForToken.color,
    '--pawn-accent': metaForToken.accent,
  };
  const selectLift = lowPerformanceMode ? (compactMode ? 2 : 3) : compactMode ? 6 : 10;
  const controls = useAnimationControls();
  const previousTokenRef = useRef<Token | undefined>(undefined);
  const currentCoordRef = useRef<BoardCoordinate>(targetCoord);
  const runIdRef = useRef(0);

  useEffect(() => {
    controls.set(getPositionStyle(targetCoord));
    currentCoordRef.current = targetCoord;
    previousTokenRef.current = token;
  }, [compactMode]);

  useEffect(() => {
    const previous = previousTokenRef.current;
    const sameState = previous && previous.state === token.state && previous.progress === token.progress;
    if (!previous || sameState) {
      controls.set(getPositionStyle(targetCoord));
      currentCoordRef.current = targetCoord;
      previousTokenRef.current = token;
      return;
    }

    const runId = ++runIdRef.current;
    const sequence = buildSequence(previous, token, compactMode);
    const stepDuration = previous.state === 'active' && token.state === 'home'
      ? compactMode ? 0.12 : 0.15
      : compactMode ? 0.4 : 0.48;

    const animate = async () => {
      for (const coord of sequence) {
        if (runIdRef.current !== runId) {
          return;
        }
        await controls.start({
          ...getPositionStyle(coord),
          transition: {
            left: { duration: stepDuration, ease: 'linear' },
            top: { duration: stepDuration, ease: 'linear' },
          },
        });
        currentCoordRef.current = coord;
        onStepSound?.();
      }
      previousTokenRef.current = token;
    };

    void animate();
  }, [compactMode, controls, onStepSound, targetCoord, token]);

  return (
    <motion.div
      className="absolute z-20"
      style={{ transform: 'translate(-50%, -50%)' }}
      initial={false}
      animate={controls}
    >
      <motion.button
        type="button"
        aria-label={`Move ${token.owner} pawn`}
        className={`pawn-piece ${compactMode ? 'pawn-piece-compact' : ''} ${selectable ? 'pawn-piece-active' : ''}`}
        style={pawnStyle}
        initial={false}
        animate={{
          x: offset.x,
          y: selectable ? [offset.y, offset.y - selectLift, offset.y] : offset.y,
          scale: selectable ? [1, 1.04, 1] : 1,
        }}
        transition={{
          x: { duration: 0.08, ease: 'linear' },
          y: selectable ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.08, ease: 'linear' },
          scale: selectable ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.08, ease: 'linear' },
        }}
        whileHover={lowPerformanceMode ? undefined : { scale: selectable ? 1.06 : 1 }}
        whileTap={{ scale: selectable ? 0.96 : 1 }}
        onClick={() => selectable && onTokenSelect(token.id)}
      >
        <span className="pawn-cap" />
        <span className="pawn-neck" />
        <span className="pawn-base" />
        <span className="sr-only">{token.owner} pawn</span>
      </motion.button>
    </motion.div>
  );
});

export function Board({ tokens, playersEnabled, selectableTokenIds, onTokenSelect, onStepSound, compactMode = false, lowPerformanceMode = false }: BoardProps) {
  const visibleTokens = useMemo(() => tokens.filter((token) => playersEnabled[token.owner]), [tokens, playersEnabled]);
  const tokenOffsets = compactMode ? tokenOffsetsCompact : tokenOffsetsRegular;

  const groupedTokens = useMemo(() => {
    const coordinateToTokens = new Map<string, { coord: BoardCoordinate; tokens: Token[] }>();
    visibleTokens.forEach((token) => {
      const coord = getDisplayCoordinate(token, compactMode);
      const key = coordKey(coord);
      const existing = coordinateToTokens.get(key) ?? { coord, tokens: [] };
      existing.tokens.push(token);
      coordinateToTokens.set(key, existing);
    });
    return Array.from(coordinateToTokens.values()).flatMap(({ coord, tokens: grouped }) =>
      grouped.map((token, index): RenderToken => ({ token, coord, offset: tokenOffsets[index] ?? { x: 0, y: 0 } })),
    );
  }, [compactMode, tokenOffsets, visibleTokens]);

  return (
    <div className={`board-shell h-full w-full overflow-hidden rounded-[2.8rem] border border-white/20 p-3 shadow-board ${compactMode ? 'board-shell-compact' : ''} ${lowPerformanceMode ? 'board-shell-performance' : ''}`}>
      <div className="board-grid relative aspect-square h-full w-full overflow-hidden rounded-[2.2rem] bg-[#f8fafc]">
        {boardCells.map((cell) => {
          const meta = cell.player ? PLAYER_META[cell.player] : null;
          const disabledPlayer = cell.player ? !playersEnabled[cell.player] : false;
          return (
            <div
              key={cell.key}
              className={`relative border border-slate-400/40 ${cell.kind === 'empty' ? 'border-transparent bg-transparent' : ''} ${cell.kind === 'track' || cell.kind === 'center' ? 'bg-white' : ''}`}
              style={{
                gridColumn: cell.col + 1,
                gridRow: cell.row + 1,
                background:
                  cell.kind === 'yard'
                    ? `${meta?.soft ?? '#fff'}`
                    : cell.kind === 'lane'
                      ? `linear-gradient(135deg, ${meta?.soft ?? '#fff'}, #ffffff)`
                      : undefined,
                opacity: disabledPlayer ? 0.42 : 1,
              }}
            >
              {cell.safe ? (
                <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-md">
                  <div className="safe-cell-ring" />
                  <div className="safe-star" />
                </div>
              ) : null}
            </div>
          );
        })}

        <div className="center-finish pointer-events-none absolute left-[40%] top-[40%] h-[20%] w-[20%]" />

        {PLAYER_ORDER.map((player) => {
          const bounds = YARD_BOUNDS[player];
          const meta = PLAYER_META[player];
          const slots = compactMode ? COMPACT_HOME_SLOTS[player] : HOME_SLOTS[player];
          return (
            <div
              key={`${player}-home-panel`}
              className="pointer-events-none absolute z-0 overflow-hidden rounded-[1.35rem] border-2"
              style={{
                left: `${bounds.colStart * CELL_PERCENT + HOME_PANEL_INSET}%`,
                top: `${bounds.rowStart * CELL_PERCENT + HOME_PANEL_INSET}%`,
                width: `${HOME_PANEL_SIZE}%`,
                height: `${HOME_PANEL_SIZE}%`,
                background: `linear-gradient(145deg, ${meta.soft}, ${meta.color})`,
                borderColor: 'rgba(255,255,255,0.88)',
                boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 10px 18px rgba(255,255,255,0.14), 0 8px 18px rgba(15,23,42,0.06)`,
                opacity: playersEnabled[player] ? 1 : 0.45,
              }}
            >
              <div className="absolute inset-[2.5%] rounded-[1.15rem] border border-white/28" />
              <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-white/65" />
              <div className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 bg-white/65" />
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                {slots.map((_, index) => (
                  <div key={`${player}-slot-${index}`} className="relative">
                    <div className="absolute inset-[8%] rounded-[0.95rem] bg-white/8" />
                    <div className="absolute inset-[11%] rounded-[0.9rem] border border-white/30 bg-white/12" />
                    <div
                      className="absolute inset-[29%] rounded-full border-2"
                      style={{
                        borderColor: 'rgba(255,255,255,0.55)',
                        background: 'rgba(255,255,255,0.14)',
                        boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.12)',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {startCells.map(({ player, coord }) => {
          const meta = PLAYER_META[player];
          const arrow = startArrowOffset[player];
          return [
            <div
              key={`${player}-start-ring`}
              className="pointer-events-none absolute z-[1] rounded-full border-2 border-white/90 shadow-[0_4px_12px_rgba(15,23,42,0.16)]"
              style={{
                left: `calc(${coord.col * CELL_PERCENT}% + ${SLOT_INSET}%)`,
                top: `calc(${coord.row * CELL_PERCENT}% + ${SLOT_INSET}%)`,
                width: `${SLOT_SIZE}%`,
                height: `${SLOT_SIZE}%`,
                background: meta.color,
                opacity: playersEnabled[player] ? 0.72 : 0.28,
              }}
            />,
            <div
              key={`${player}-start-arrow`}
              className="pointer-events-none absolute z-[1] h-0 w-0"
              style={{
                left: `calc(${((coord.col + 0.5) / BOARD_SIZE) * 100}% + ${arrow.x}px)`,
                top: `calc(${((coord.row + 0.5) / BOARD_SIZE) * 100}% + ${arrow.y}px)`,
                transform: `translate(-50%, -50%) rotate(${arrow.rotation}deg)`,
                borderTop: '9px solid transparent',
                borderBottom: '9px solid transparent',
                borderLeft: `14px solid ${meta.accent}`,
                filter: 'drop-shadow(0 2px 3px rgba(15,23,42,0.18))',
                opacity: playersEnabled[player] ? 0.6 : 0.22,
              }}
            />,
          ];
        })}

        {groupedTokens.map(({ token, coord, offset }) => (
          <PawnToken
            key={token.id}
            token={token}
            targetCoord={coord}
            offset={offset}
            selectable={selectableTokenIds.includes(token.id)}
            compactMode={compactMode}
            lowPerformanceMode={lowPerformanceMode}
            onTokenSelect={onTokenSelect}
            onStepSound={onStepSound}
          />
        ))}
      </div>
    </div>
  );
}
