import { Trophy, RotateCcw, Home } from 'lucide-react';

interface GameOverProps {
  winnerLabel: string;
  isPlayerWinner: boolean;
  onRestart: () => void;
  onMenu: () => void;
}

export default function GameOver({
  winnerLabel,
  isPlayerWinner,
  onRestart,
  onMenu,
}: GameOverProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-7 text-center animate-pop">
        <div
          className={[
            'inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 shadow-lg',
            isPlayerWinner
              ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-emerald-500/40'
              : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/30',
          ].join(' ')}
        >
          <Trophy className="w-10 h-10 text-white" strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          {isPlayerWinner ? 'Você venceu!' : 'Fim de jogo'}
        </h2>
        <p className="mt-1.5 text-slate-500 dark:text-slate-400">
          {winnerLabel} alcançou o objetivo.
        </p>

        <div className="mt-7 space-y-2.5">
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-bold shadow-lg shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition"
          >
            <RotateCcw className="w-5 h-5" />
            Jogar novamente
          </button>
          <button
            onClick={onMenu}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Home className="w-5 h-5" />
            Menu principal
          </button>
        </div>
      </div>
    </div>
  );
}
