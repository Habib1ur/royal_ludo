import {
  FINAL_PROGRESS,
  HOME_LANES,
  HOME_SLOTS,
  OUTER_PATH,
  OUTER_PATH_LENGTH,
  SAFE_INDICES,
  START_INDEX_BY_PLAYER,
} from '../constants/board';
import { BoardCoordinate, Token } from '../types/game';

export const getHomeSlotIndex = (tokenId: string) => Number(tokenId.split('-')[1]) || 0;

export const getTokenOuterIndex = (token: Token): number | null => {
  if (token.progress === null || token.progress >= OUTER_PATH_LENGTH) {
    return null;
  }

  return (START_INDEX_BY_PLAYER[token.owner] + token.progress) % OUTER_PATH_LENGTH;
};

export const getTokenCoordinate = (token: Token, homeSlotIndex = getHomeSlotIndex(token.id)): BoardCoordinate | null => {
  if (token.state === 'home') {
    return HOME_SLOTS[token.owner][homeSlotIndex];
  }

  if (token.state === 'finished' || token.progress === FINAL_PROGRESS) {
    return null;
  }

  if (token.progress === null) {
    return HOME_SLOTS[token.owner][homeSlotIndex];
  }

  if (token.progress < OUTER_PATH_LENGTH) {
    return OUTER_PATH[(START_INDEX_BY_PLAYER[token.owner] + token.progress) % OUTER_PATH_LENGTH];
  }

  return HOME_LANES[token.owner][token.progress - OUTER_PATH_LENGTH];
};

export const getTokenPathCoordinate = (token: Token, progress: number): BoardCoordinate => {
  if (progress < OUTER_PATH_LENGTH) {
    return OUTER_PATH[(START_INDEX_BY_PLAYER[token.owner] + progress) % OUTER_PATH_LENGTH];
  }

  return HOME_LANES[token.owner][progress - OUTER_PATH_LENGTH];
};

export const isSafeOuterIndex = (outerIndex: number | null) =>
  outerIndex !== null && SAFE_INDICES.includes(outerIndex);

export const canMoveToken = (token: Token, diceValue: number) => {
  if (token.state === 'finished') {
    return false;
  }

  if (token.state === 'home') {
    return diceValue === 6;
  }

  if (token.progress === null) {
    return false;
  }

  return token.progress + diceValue <= FINAL_PROGRESS;
};


export const getProtectedStackOwner = (outerIndex: number | null, tokens: Token[]) => {
  if (outerIndex === null) {
    return null;
  }

  const occupants = tokens.filter((token) => token.state === 'active' && getTokenOuterIndex(token) === outerIndex);
  const counts = new Map<string, number>();

  for (const token of occupants) {
    counts.set(token.owner, (counts.get(token.owner) ?? 0) + 1);
  }

  for (const [owner, count] of counts.entries()) {
    if (count >= 2) {
      return owner;
    }
  }

  return null;
};

export const getCaptureCandidates = (movedToken: Token, tokens: Token[]): Token[] => {
  const movedOuterIndex = getTokenOuterIndex(movedToken);

  if (movedOuterIndex === null || isSafeOuterIndex(movedOuterIndex)) {
    return [];
  }

  const protectedOwner = getProtectedStackOwner(movedOuterIndex, tokens);
  if (protectedOwner && protectedOwner !== movedToken.owner) {
    return [];
  }

  return tokens.filter((token) => {
    if (token.owner === movedToken.owner || token.state !== 'active') {
      return false;
    }

    return getTokenOuterIndex(token) === movedOuterIndex;
  });
};
