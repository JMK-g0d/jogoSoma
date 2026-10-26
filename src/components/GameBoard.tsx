import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Home,
  RotateCcw,
  Loader2,
  History,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { Difficulty, GameMode, Move, PlayerId, PlayerInfo } from '@/types';
import {
  cpuPick,
  isWinningSum,
  MIN_PICK,
  MAX_PICK,
  playersForMode,
  randomStartingPlayerId,
  teamLabelOf,
} from '@/game/logic';
import { getSoundEngine } from '@/game/sound';
import NumberPad from './NumberPad';
import HistoryList, { HistoryHeader } from './HistoryList';
import GameOver from './GameOver';

interface GameBoardProps {
  mode: GameMode;
  difficulty: Difficulty;
  target: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onMenu: () => void;
  onRestart: () => void;
  matchId: number;
}

export default function GameBoard({
  mode,
  difficulty,
  target,
  soundEnabled,
  onToggleSound,
  onMenu,
  onRestart,
}: GameBoardProps) {
  const isSolo = mode === 'solo';
  const isTeams = mode === 'teams';

  const players = useMemo(() => playersForMode(mode), [mode]);

  const [currentSum, setCurrentSum] = useState(0);
  const [moves, setMoves] = useState<Move[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<PlayerId>(() =>
    randomStartingPlayerId(mode),
  );
  const [winnerId, setWinnerId] = useState<PlayerId | null>(null);
  const [cpuThinking, setCpuThinking] = useState(false);
  const moveCounter = useRef(0);

  const currentPlayer = players.find((p) => p.id === currentPlayerId)!;
  const gameEnded = winnerId !== null;
  const sound = getSoundEngine();

  const nextPlayerId = useCallback(
    (id: PlayerId): PlayerId => {
      const idx = players.findIndex((p) => p.id === id);
      return players[(idx + 1) % players.length].id;
    },
    [players],
  );

  const applyMove = useCallback(
    (playerId: PlayerId, number: number) => {
      const newSum = currentSum + number;
      moveCounter.current += 1;
      const player = players.find((p) => p.id === playerId)!;
      const move: Move = {
        id: moveCounter.current,
        player: playerId,
        label: player.name,
        number,
        sumAfter: newSum,
      };

      setCurrentSum(newSum);
      setMoves((prev) => [move, ...prev]);

      if (isWinningSum(newSum, target)) {
        setWinnerId(playerId);
        const playerIsHumanWinner = playerId === 'player1';
        const humanLostToCpu = isSolo && playerId === 'cpu';
        if (playerIsHumanWinner || (!isSolo && !humanLostToCpu && playerId !== 'cpu')) {
          sound.play('win');
        } else if (humanLostToCpu) {
          sound.play('lose');
        } else {
          // Multiplayer human winner -> positive chime.
          sound.play('win');
        }
      } else {
        sound.play('move');
        setCurrentPlayerId(nextPlayerId(playerId));
      }
    },
    [currentSum, isSolo, nextPlayerId, players, sound, target],
  );

  // CPU turn.
  useEffect(() => {
    if (gameEnded) return;
    if (!currentPlayer.isCpu) return;

    setCpuThinking(true);
    const delay = 700 + Math.random() * 600;
    const pick = cpuPick(currentSum, difficulty, target);

    const timer = setTimeout(() => {
      setCpuThinking(false);
      applyMove(currentPlayer.id, pick);
    }, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayerId, currentSum, gameEnded]);

  const handlePick = useCallback(
    (n: number) => {
      if (gameEnded || currentPlayer.isCpu) return;
      if (currentSum + n > target) {
        sound.play('invalid');
        return;
      }
      sound.play('click');
      applyMove(currentPlayer.id, n);
    },
    [applyMove, currentPlayer, currentSum, gameEnded, sound, target],
  );

  const winner = winnerId ? players.find((p) => p.id === winnerId)! : null;

  // For team mode, the "winner" is the whole team. For solo, the human is player1.
  const winnerLabel = winner
    ? isTeams
      ? teamLabelOf(winner)
      : winner.name
    : '';

  // Player1 is the human in solo; in multiplayer there's no single "you",
  // so we treat any human win as a positive outcome.
  const isPlayerWinner = winnerId === 'player1';

  const remaining = Math.max(0, target - currentSum);
  const progressPct = Math.min(100, (currentSum / target) * 100);

  const turnBanner = (() => {
    if (gameEnded) return null;
    if (currentPlayer.isCpu) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {currentPlayer.name} está pensando…
        </>
      );
    }
    return (
      <>
        Sua vez, <span className="font-extrabold">{currentPlayer.name}</span>
      </>
    );
  })();

  return (
    <div className="w-full max-w-md mx-auto px-5 py-8 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onMenu}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-medium transition"
        >
          <Home className="w-4 h-4" />
          Menu
        </button>
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {modeLabel(mode)}
          {isSolo ? ` · ${difficultyLabel(difficulty)}` : ''}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar' : 'Ativar som'}
            aria-label={soundEnabled ? 'Silenciar' : 'Ativar som'}
            className={[
              'w-8 h-8 rounded-lg flex items-center justify-center transition',
              soundEnabled
                ? 'text-slate-400 hover:text-sky-600 dark:hover:text-sky-400'
                : 'text-slate-300 hover:text-slate-500 dark:text-slate-600',
            ].join(' ')}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-medium transition"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar
          </button>
        </div>
      </div>

      {/* Sum display */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-6 text-center shadow-xl overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-sky-400 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-cyan-400 blur-3xl" />
        </div>
        <div className="relative">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            Soma atual
          </p>
          <p className="text-7xl font-black text-white tabular-nums leading-none">
            {currentSum}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-slate-300 text-sm">
            <span className="font-mono">Objetivo: {target}</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono">Faltam {remaining}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Player chips (for trio / teams, show all; for solo/duo keep compact) */}
      {(mode === 'trio' || mode === 'teams') && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {players.map((p) => {
            const active = p.id === currentPlayerId && !gameEnded;
            return (
              <span
                key={p.id}
                className={[
                  'px-2.5 py-1 rounded-full text-xs font-bold border transition-colors',
                  active
                    ? p.team === 'A'
                      ? 'bg-sky-100 border-sky-300 text-sky-700 dark:bg-sky-900/40 dark:border-sky-700 dark:text-sky-300'
                      : p.team === 'B'
                        ? 'bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/40 dark:border-rose-700 dark:text-rose-300'
                        : 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400',
                ].join(' ')}
              >
                {p.name}
              </span>
            );
          })}
        </div>
      )}

      {/* Turn banner */}
      {!gameEnded && (
        <div
          className={[
            'mt-5 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-colors',
            currentPlayer.isCpu
              ? 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/60'
              : currentPlayer.team === 'B'
                ? 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800/60'
                : 'bg-sky-50 text-sky-700 border border-sky-100 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800/60',
          ].join(' ')}
        >
          {turnBanner}
        </div>
      )}

      {/* Number pad */}
      <div className="mt-5">
        <NumberPad
          currentSum={currentSum}
          target={target}
          disabled={gameEnded || currentPlayer.isCpu}
          onPick={handlePick}
        />
        {currentSum >= target - MAX_PICK && !gameEnded && currentSum < target && (
          <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
            Jogadas que ultrapassam {target} ficam desativadas.
          </p>
        )}
      </div>

      {/* History */}
      <div className="mt-7">
        <HistoryHeader />
        <HistoryList moves={moves} />
      </div>

      {gameEnded && winner && (
        <GameOver
          winnerLabel={winnerLabel}
          isPlayerWinner={isPlayerWinner}
          onRestart={onRestart}
          onMenu={onMenu}
        />
      )}
    </div>
  );
}

function modeLabel(m: GameMode): string {
  switch (m) {
    case 'solo':
      return 'Solo';
    case 'duo':
      return '2 Jogadores';
    case 'trio':
      return '3 Jogadores';
    case 'teams':
      return 'Duplas (2x2)';
  }
}

function difficultyLabel(d: Difficulty): string {
  return d === 'easy' ? 'Fácil' : d === 'medium' ? 'Médio' : 'Difícil';
}

// Keep constants referenced for tree-shaking friendliness.
void MIN_PICK;
void MAX_PICK;
