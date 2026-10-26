import { useEffect, useState } from 'react';
import {
  Plus,
  Users,
  Bot,
  ChevronRight,
  Cpu,
  Zap,
  Brain,
  ArrowLeft,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Dices,
  Target,
  User,
  UserPlus,
  Shield,
} from 'lucide-react';
import type { GameMode, Difficulty } from '@/types';
import { DEFAULT_TARGET, randomTarget } from '@/game/logic';

interface MenuProps {
  dark: boolean;
  soundEnabled: boolean;
  onToggleDark: () => void;
  onToggleSound: () => void;
  onStart: (mode: GameMode, difficulty: Difficulty, target: number) => void;
}

interface DiffOption {
  id: Difficulty;
  label: string;
  desc: string;
  icon: typeof Zap;
  box: string;
  iconCls: string;
  border: string;
  bannerBg: string;
  bannerBorder: string;
}

const DIFFICULTIES: DiffOption[] = [
  {
    id: 'easy',
    label: 'Fácil',
    desc: 'Jogadas aleatórias',
    icon: Zap,
    box: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconCls: 'text-emerald-600 dark:text-emerald-400',
    border:
      'hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/30',
    bannerBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    bannerBorder: 'border-emerald-100 dark:border-emerald-800/60',
  },
  {
    id: 'medium',
    label: 'Médio',
    desc: 'Estratégia no fim do jogo',
    icon: Cpu,
    box: 'bg-amber-100 dark:bg-amber-900/40',
    iconCls: 'text-amber-600 dark:text-amber-400',
    border:
      'hover:border-amber-300 hover:bg-amber-50 dark:hover:border-amber-700 dark:hover:bg-amber-900/30',
    bannerBg: 'bg-amber-50 dark:bg-amber-900/30',
    bannerBorder: 'border-amber-100 dark:border-amber-800/60',
  },
  {
    id: 'hard',
    label: 'Difícil',
    desc: 'Lógica matemática avançada',
    icon: Brain,
    box: 'bg-rose-100 dark:bg-rose-900/40',
    iconCls: 'text-rose-600 dark:text-rose-400',
    border:
      'hover:border-rose-300 hover:bg-rose-50 dark:hover:border-rose-700 dark:hover:bg-rose-900/30',
    bannerBg: 'bg-rose-50 dark:bg-rose-900/30',
    bannerBorder: 'border-rose-100 dark:border-rose-800/60',
  },
];

type ModeOption = {
  id: GameMode;
  label: string;
  sub: string;
  icon: typeof Users;
};

const MODES: ModeOption[] = [
  { id: 'solo', label: 'Modo Solo', sub: 'Você contra a máquina', icon: Bot },
  { id: 'duo', label: '2 Jogadores', sub: 'Dois no mesmo aparelho', icon: Users },
  { id: 'trio', label: '3 Jogadores', sub: 'Três em turnos alternados', icon: UserPlus },
  { id: 'teams', label: 'Duplas (2x2)', sub: 'Dupla A vs Dupla B', icon: Shield },
];

export default function Menu({
  dark,
  soundEnabled,
  onToggleDark,
  onToggleSound,
  onStart,
}: MenuProps) {
  const [step, setStep] = useState<'mode' | 'difficulty' | 'confirm'>('mode');
  const [mode, setMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [randomObj, setRandomObj] = useState(false);
  const [target, setTarget] = useState(DEFAULT_TARGET);

  // Re-roll the visible target when the random toggle is turned on.
  useEffect(() => {
    if (randomObj) setTarget(randomTarget());
  }, [randomObj]);

  const selectedDiff = DIFFICULTIES.find((d) => d.id === difficulty) ?? null;
  const isSolo = mode === 'solo';

  const reset = () => {
    setStep('mode');
    setMode(null);
    setDifficulty(null);
  };

  const handleStart = () => {
    if (!mode) return;
    const finalTarget = randomObj ? randomTarget() : target;
    onStart(
      mode,
      difficulty ?? 'easy', // ignored for non-solo modes
      finalTarget,
    );
    reset();
  };

  const handleMode = (m: GameMode) => {
    setMode(m);
    if (m === 'solo') {
      setStep('difficulty');
    } else {
      setStep('confirm');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-5 py-8 animate-fade-in">
      {/* Header controls */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <IconButton
          onClick={onToggleSound}
          active={soundEnabled}
          title={soundEnabled ? 'Silenciar' : 'Ativar som'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </IconButton>
        <IconButton
          onClick={onToggleDark}
          active={!dark}
          title={dark ? 'Modo claro' : 'Modo escuro'}
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </IconButton>
      </div>

      {/* Title */}
      <header className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 shadow-lg shadow-sky-500/30 mb-5">
          <Plus className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          JOGO DA SOMA
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
          Some números de 1 a 9 e chegue exatamente ao objetivo para vencer.
        </p>
      </header>

      {/* Step: choose mode */}
      {step === 'mode' && (
        <div className="space-y-3 animate-fade-in">
          {MODES.map((m) => (
            <MenuButton
              key={m.id}
              label={m.label}
              sub={m.sub}
              icon={m.icon}
              onClick={() => handleMode(m.id)}
            />
          ))}

          {/* Objective setting */}
          <div className="mt-6 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                  <Target className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    Objetivo da soma
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {randomObj ? 'Aleatório (10 a 150)' : `Fixo em ${target}`}
                  </p>
                </div>
              </div>
              <Toggle checked={randomObj} onChange={setRandomObj} />
            </div>

            {!randomObj && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  <span>10</span>
                  <span className="text-slate-700 dark:text-slate-200 font-bold">
                    {target}
                  </span>
                  <span>150</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={150}
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
            )}

            {randomObj && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Dices className="w-3.5 h-3.5" />
                Um novo objetivo será sorteado a cada partida.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step: choose difficulty (solo only) */}
      {step === 'difficulty' && (
        <div className="animate-fade-in">
          <BackBar onBack={() => setStep('mode')} title="Escolha a dificuldade" />
          <div className="space-y-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setDifficulty(d.id);
                  setStep('confirm');
                }}
                className={`group w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900 transition text-left ${d.border}`}
              >
                <div
                  className={`flex-shrink-0 w-11 h-11 rounded-xl ${d.box} flex items-center justify-center`}
                >
                  <d.icon className={`w-5 h-5 ${d.iconCls}`} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    {d.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {d.desc}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: confirm & start */}
      {step === 'confirm' && mode && (
        <div className="animate-fade-in">
          <BackBar
            onBack={() => setStep(isSolo ? 'difficulty' : 'mode')}
            title="Confirme para começar"
          />

          <div className="space-y-3 mb-5">
            <SummaryRow
              icon={isSolo ? Bot : mode === 'teams' ? Shield : User}
              label="Modo"
              value={
                isSolo
                  ? 'Solo'
                  : mode === 'duo'
                    ? '2 Jogadores'
                    : mode === 'trio'
                      ? '3 Jogadores'
                      : 'Duplas (2x2)'
              }
            />
            {isSolo && selectedDiff && (
              <SummaryRow
                icon={selectedDiff.icon}
                label="Dificuldade"
                value={selectedDiff.label}
              />
            )}
            <SummaryRow
              icon={randomObj ? Dices : Target}
              label="Objetivo"
              value={randomObj ? 'Aleatório (10–150)' : String(target)}
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Quem começa é sorteado automaticamente.
          </p>

          <button
            onClick={handleStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-bold shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 active:translate-y-0 transition"
          >
            Começar partida
          </button>
        </div>
      )}

      <footer className="mt-10 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Regra: cada jogada soma de 1 a 9. Quem alcançar exatamente o objetivo vence.
        </p>
      </footer>
    </div>
  );
}

/* ---------- small building blocks ---------- */

function IconButton({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={[
        'w-9 h-9 rounded-xl flex items-center justify-center transition border',
        active
          ? 'bg-sky-50 border-sky-200 text-sky-600 dark:bg-sky-900/40 dark:border-sky-800 dark:text-sky-300'
          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative w-11 h-6 rounded-full transition-colors',
        checked ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}

function BackBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={onBack}
        className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
      <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
        <Icon className="w-4 h-4 text-slate-500 dark:text-slate-300" />
      </div>
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="ml-auto font-bold text-slate-800 dark:text-slate-100">
        {value}
      </span>
    </div>
  );
}

function MenuButton({
  label,
  sub,
  icon: Icon,
  onClick,
}: {
  label: string;
  sub: string;
  icon: typeof Users;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-sky-300 hover:bg-sky-50 transition text-left dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700 dark:hover:bg-sky-900/20"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
        <Icon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-slate-800 text-lg dark:text-slate-100">{label}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{sub}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition" />
    </button>
  );
}
