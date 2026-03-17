import { RotateCcw, SlidersHorizontal, Undo2 } from 'lucide-react';

type ControlPanelProps = {
  turnLabel: string;
  diceValue: number | null;
  selectableCount: number;
  autoMoveSingle: boolean;
  performanceMode: boolean;
  showHints: boolean;
  turnTimerSeconds: number;
  timerRemaining: number;
  canUndo: boolean;
  onUndo: () => void;
  onHelp: () => void;
  onReset: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
};

export function ControlPanel({
  turnLabel,
  diceValue,
  selectableCount,
  autoMoveSingle,
  performanceMode,
  showHints,
  turnTimerSeconds,
  timerRemaining,
  canUndo,
  onUndo,
  onHelp,
  onReset,
  theme,
  onToggleTheme,
}: ControlPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-glass backdrop-blur-xl">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Match status</p>
        <h2 className="font-display text-2xl font-semibold text-white">{turnLabel}</h2>
      </div>

      <div className="grid gap-3 text-sm text-slate-200">
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          {diceValue === null
            ? 'Roll the dice to reveal valid moves.'
            : selectableCount > 1
              ? `Choose one of ${selectableCount} highlighted pawns.`
              : selectableCount === 1
                ? autoMoveSingle
                  ? 'Single legal move detected. The pawn moves automatically.'
                  : 'One legal move available. Tap the highlighted pawn.'
                : 'No legal move remains for this roll.'}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Turn timer</p>
            <p className="mt-2 text-xl font-semibold text-white">{turnTimerSeconds === 0 ? 'Off' : `${timerRemaining}s`}</p>
          </div>
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-white">
              <Undo2 className="h-4 w-4" />
              <span className="font-medium">Undo last turn</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">Revert the previous roll and move.</p>
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-white">
            <SlidersHorizontal className="h-4 w-4" />
            <p className="font-medium">Match options</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.24em] text-slate-300">
            <span className="rounded-full border border-white/10 px-3 py-1">{performanceMode ? 'Performance mode' : 'Standard mode'}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">{showHints ? 'Hints on' : 'Hints off'}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">{autoMoveSingle ? 'Auto move' : 'Manual move'}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">{turnTimerSeconds === 0 ? 'No timer' : `${turnTimerSeconds}s timer`}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <button type="button" onClick={onHelp} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 transition hover:bg-white/15">
            Rules
          </button>
          <button type="button" onClick={onToggleTheme} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 transition hover:bg-white/15">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button type="button" onClick={onUndo} disabled={!canUndo} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50">
            Undo
          </button>
          <button type="button" onClick={onReset} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 transition hover:bg-white/15">
            <span className="inline-flex items-center gap-2"><RotateCcw className="h-4 w-4" />Reset</span>
          </button>
        </div>
      </div>
    </section>
  );
}
