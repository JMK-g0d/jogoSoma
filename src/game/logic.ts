import type { Difficulty, GameMode, PlayerId, PlayerInfo } from '@/types';

export const DEFAULT_TARGET = 100;
export const MIN_PICK = 1;
export const MAX_PICK = 9;

export function validMoves(currentSum: number, target: number): number[] {
  const moves: number[] = [];
  for (let n = MIN_PICK; n <= MAX_PICK; n++) {
    if (currentSum + n <= target) moves.push(n);
  }
  return moves;
}

export function isWinningSum(sum: number, target: number): boolean {
  return sum === target;
}

export function randomTarget(): number {
  // 10 to 150 inclusive
  return Math.floor(Math.random() * 141) + 10;
}

/**
 * Perfect-play strategy for the "race to target" game when target is a
 * multiple of 10: winning positions are the multiples of 10. For arbitrary
 * targets the forcing interval is MAX_PICK+1 (=10): the player who lands on
 * target, target-10, target-20, ... controls the game.
 */
function strategicMove(currentSum: number, target: number): number | null {
  const stride = MAX_PICK + 1; // 10
  const remainder = (currentSum - target) % stride;
  const offset = remainder <= 0 ? -remainder : stride - remainder;
  // offset is how far we need to climb to reach the next "control" number.
  if (offset === 0) return null; // already on a control number
  if (offset >= MIN_PICK && offset <= MAX_PICK && currentSum + offset <= target) {
    return offset;
  }
  return null;
}

function randomMove(currentSum: number, target: number): number {
  const moves = validMoves(currentSum, target);
  return moves[Math.floor(Math.random() * moves.length)];
}

export function cpuPick(
  currentSum: number,
  difficulty: Difficulty,
  target: number,
): number {
  const remaining = target - currentSum;

  if (difficulty === 'easy') {
    return randomMove(currentSum, target);
  }

  if (difficulty === 'medium') {
    // Plays strategically only in the endgame (<=30 to go, capped by remaining).
    if (remaining <= 30) {
      const move = strategicMove(currentSum, target);
      if (move) return move;
    }
    return randomMove(currentSum, target);
  }

  // Hard: always try to control the forcing interval (multiples of 10 from target).
  const move = strategicMove(currentSum, target);
  if (move) return move;
  // Already on a control number (opponent played perfectly). Stall randomly.
  return randomMove(currentSum, target);
}

export function playersForMode(mode: GameMode): PlayerInfo[] {
  switch (mode) {
    case 'solo':
      return [
        { id: 'player1', name: 'Você', isCpu: false },
        { id: 'cpu', name: 'Computador', isCpu: true },
      ];
    case 'duo':
      return [
        { id: 'player1', name: 'Jogador 1', isCpu: false },
        { id: 'player2', name: 'Jogador 2', isCpu: false },
      ];
    case 'trio':
      return [
        { id: 'player1', name: 'Jogador 1', isCpu: false },
        { id: 'player2', name: 'Jogador 2', isCpu: false },
        { id: 'player3', name: 'Jogador 3', isCpu: false },
      ];
    case 'teams':
      return [
        { id: 'teamA1', name: 'Dupla A · 1', isCpu: false, team: 'A' },
        { id: 'teamB1', name: 'Dupla B · 1', isCpu: false, team: 'B' },
        { id: 'teamA2', name: 'Dupla A · 2', isCpu: false, team: 'A' },
        { id: 'teamB2', name: 'Dupla B · 2', isCpu: false, team: 'B' },
      ];
  }
}

export function randomStartingPlayerId(mode: GameMode): PlayerId {
  const players = playersForMode(mode);
  return players[Math.floor(Math.random() * players.length)].id;
}

/** For team mode, the winner team is derived from the winning player. */
export function teamLabelOf(player: PlayerInfo): string {
  return player.team === 'A' ? 'Dupla A' : 'Dupla B';
}
