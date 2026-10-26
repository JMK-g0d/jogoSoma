import { useCallback, useEffect, useState } from 'react';
import type { GameMode, Difficulty, Screen } from '@/types';
import Menu from '@/components/Menu';
import GameBoard from '@/components/GameBoard';
import { getSoundEngine } from '@/game/sound';
import { DEFAULT_TARGET } from '@/game/logic';

const DARK_KEY = 'jogo-soma:dark';
const SOUND_KEY = 'jogo-soma:sound';

function readBool(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback;
  const v = window.localStorage.getItem(key);
  if (v === null) return fallback;
  return v === '1';
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [mode, setMode] = useState<GameMode>('solo');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [matchId, setMatchId] = useState(0);

  const [dark, setDark] = useState(() => readBool(DARK_KEY, false));
  const [soundEnabled, setSoundEnabled] = useState(() => readBool(SOUND_KEY, true));

  // Apply + persist dark mode.
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
    window.localStorage.setItem(DARK_KEY, dark ? '1' : '0');
  }, [dark]);

  // Apply + persist sound preference.
  useEffect(() => {
    getSoundEngine().setEnabled(soundEnabled);
    window.localStorage.setItem(SOUND_KEY, soundEnabled ? '1' : '0');
  }, [soundEnabled]);

  const startGame = useCallback(
    (m: GameMode, d: Difficulty, t: number) => {
      setMode(m);
      setDifficulty(d);
      setTarget(t);
      setMatchId((n) => n + 1);
      setScreen('game');
    },
    [],
  );

  const goMenu = useCallback(() => setScreen('menu'), []);
  const restart = useCallback(() => setMatchId((n) => n + 1), []);

  const toggleDark = useCallback(() => {
    getSoundEngine().play('click');
    setDark((v) => !v);
  }, []);
  const toggleSound = useCallback(() => {
    setSoundEnabled((v) => {
      const next = !v;
      // Play a confirmation click only when turning sound back on.
      if (next) getSoundEngine().play('click');
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors">
      {screen === 'menu' && (
        <Menu
          dark={dark}
          soundEnabled={soundEnabled}
          onToggleDark={toggleDark}
          onToggleSound={toggleSound}
          onStart={startGame}
        />
      )}
      {screen === 'game' && (
        <GameBoard
          key={matchId}
          matchId={matchId}
          mode={mode}
          difficulty={difficulty}
          target={target}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onMenu={goMenu}
          onRestart={restart}
        />
      )}
    </div>
  );
}
