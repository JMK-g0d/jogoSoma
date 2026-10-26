import { History } from 'lucide-react';
import type { Move } from '@/types';

interface HistoryListProps {
  moves: Move[];
}

export default function HistoryList({ moves }: HistoryListProps) {
  if (moves.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">
        Nenhuma jogada ainda.
      </div>
    );
  }

  return (
    <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
      {moves.map((m, idx) => {
        const isLast = idx === moves.length - 1;
        return (
          <div
            key={m.id}
            className={[
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm',
              isLast
                ? 'bg-sky-50 border border-sky-100 dark:bg-sky-900/30 dark:border-sky-800/60'
                : 'bg-slate-50 dark:bg-slate-800/60',
            ].join(' ')}
          >
            <span className="w-7 h-7 flex-shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">
              +{m.number}
            </span>
            <span className="text-slate-600 dark:text-slate-300 truncate">
              {m.label}
            </span>
            <span className="ml-auto font-mono font-bold text-slate-700 dark:text-slate-200">
              {m.sumAfter}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function HistoryHeader() {
  return (
    <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
      <History className="w-3.5 h-3.5" />
      Histórico
    </h3>
  );
}
