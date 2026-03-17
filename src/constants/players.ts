import { PlayerColor, PlayerConfig } from '../types/game';

export const PLAYER_ORDER: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

export const PLAYER_META: Record<
  PlayerColor,
  {
    label: string;
    color: string;
    soft: string;
    tokenShadow: string;
    accent: string;
    avatar: string;
  }
> = {
  red: {
    label: 'Ruby',
    color: '#ef4444',
    soft: '#fecaca',
    tokenShadow: 'rgba(239, 68, 68, 0.35)',
    accent: '#991b1b',
    avatar: 'R',
  },
  green: {
    label: 'Emerald',
    color: '#22c55e',
    soft: '#bbf7d0',
    tokenShadow: 'rgba(34, 197, 94, 0.35)',
    accent: '#166534',
    avatar: 'G',
  },
  yellow: {
    label: 'Gold',
    color: '#facc15',
    soft: '#fef08a',
    tokenShadow: 'rgba(250, 204, 21, 0.35)',
    accent: '#a16207',
    avatar: 'Y',
  },
  blue: {
    label: 'Sapphire',
    color: '#3b82f6',
    soft: '#bfdbfe',
    tokenShadow: 'rgba(59, 130, 246, 0.35)',
    accent: '#1d4ed8',
    avatar: 'B',
  },
};

export const DEFAULT_PLAYERS: PlayerConfig[] = PLAYER_ORDER.map((color, index) => ({
  color,
  name: `Player ${index + 1}`,
  enabled: color === 'red' || color === 'yellow',
  avatar: PLAYER_META[color].avatar,
  kind: 'human',
}));
