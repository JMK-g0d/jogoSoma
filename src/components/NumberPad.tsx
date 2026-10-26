import { MIN_PICK, MAX_PICK } from '@/game/logic';

interface NumberPadProps {
  currentSum: number;
  target: number;
  disabled: boolean;
  onPick: (n: number) => void;
}

export default function NumberPad({ currentSum, target, disabled, onPick }: NumberPadProps) {
  const numbers = Array.from({ length: MAX_PICK - MIN_PICK + 1 }, (_, i) => i + MIN_PICK);

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {numbers.map((n) => {
        const invalid = currentSum + n > target;
        const isDisabled = disabled || invalid;
        return (
          <button
            key={n}
            onClick={() => onPick(n)}
            disabled={isDisabled}
            className={[
              'aspect-square rounded-2xl text-2xl font-black transition-all',
              'flex items-center justify-center select-none',
              isDisabled
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                : 'bg-white text-slate-800 border-2 border-slate-100 hover:border-sky-400 hover:bg-sky-50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-sm dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:border-sky-500 dark:hover:bg-sky-900/30',
            ].join(' ')}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
