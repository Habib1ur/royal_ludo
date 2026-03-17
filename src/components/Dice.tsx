import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type DiceProps = {
  value: number | null;
  rolling: boolean;
  disabled: boolean;
  manualMode: boolean;
  fullscreen?: boolean;
  onRoll: () => void;
  onManualSubmit: (value: number) => void;
};

const pipMap: Record<number, [number, number][]> = {
  1: [[2, 2]],
  2: [[1, 1], [3, 3]],
  3: [[1, 1], [2, 2], [3, 3]],
  4: [[1, 1], [1, 3], [3, 1], [3, 3]],
  5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
  6: [[1, 1], [2, 1], [3, 1], [1, 3], [2, 3], [3, 3]],
};

export function Dice({ value, rolling, disabled, manualMode, fullscreen = false, onRoll, onManualSubmit }: DiceProps) {
  const [displayValue, setDisplayValue] = useState(value ?? 1);
  const [selectedManual, setSelectedManual] = useState<number>(1);

  useEffect(() => {
    if (!rolling) {
      setDisplayValue(value ?? 1);
      return;
    }

    let frame = 0;
    const interval = window.setInterval(() => {
      frame += 1;
      setDisplayValue(((frame % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6);
    }, 95);

    return () => window.clearInterval(interval);
  }, [rolling, value]);

  const standardShell = fullscreen
    ? 'rounded-[1.4rem] border border-slate-200/70 bg-[linear-gradient(165deg,rgba(248,250,252,0.97),rgba(226,232,240,0.94)_54%,rgba(203,213,225,0.9)_100%)] p-3 text-slate-950 shadow-[0_16px_30px_rgba(15,23,42,0.22)] backdrop-blur-md'
    : 'rounded-[2rem] border border-amber-200/30 bg-[linear-gradient(160deg,rgba(15,23,42,0.96),rgba(30,41,59,0.94))] p-4 text-white shadow-[0_18px_50px_rgba(15,23,42,0.35)] sm:p-5';
  const manualShell = fullscreen
    ? 'rounded-[1.4rem] border border-slate-200/70 bg-[linear-gradient(165deg,rgba(248,250,252,0.97),rgba(226,232,240,0.94)_54%,rgba(203,213,225,0.9)_100%)] p-3 text-slate-950 shadow-[0_16px_30px_rgba(15,23,42,0.22)] backdrop-blur-md'
    : 'rounded-[2rem] border border-amber-200/30 bg-[linear-gradient(160deg,rgba(15,23,42,0.96),rgba(30,41,59,0.94))] p-4 text-white shadow-[0_18px_50px_rgba(15,23,42,0.35)] sm:p-5';
  const standardDie = fullscreen
    ? 'relative grid h-14 w-14 shrink-0 grid-cols-3 grid-rows-3 rounded-[1rem] border border-slate-900/15 bg-gradient-to-br from-white via-slate-100 to-slate-300 p-2 shadow-xl'
    : 'relative grid h-20 w-20 shrink-0 grid-cols-3 grid-rows-3 rounded-[1.4rem] border border-slate-900/15 bg-gradient-to-br from-white via-slate-100 to-slate-300 p-3 shadow-2xl sm:h-24 sm:w-24 sm:p-4';
  const pipClass = fullscreen
    ? 'm-auto h-2.5 w-2.5 rounded-full bg-slate-900 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)]'
    : 'm-auto h-3 w-3 rounded-full bg-slate-900 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] sm:h-3.5 sm:w-3.5';

  if (manualMode) {
    return (
      <div className={manualShell}>
        <div className={`flex items-start justify-between gap-3 ${fullscreen ? 'mb-2' : 'mb-4'}`}>
          <div>
            <p className={`uppercase tracking-[0.3em] ${fullscreen ? 'text-[10px] text-slate-600' : 'text-xs text-amber-200/80'}`}>Offline Dice</p>
            <p className={`font-display font-semibold ${fullscreen ? 'text-sm text-slate-950' : 'text-lg text-white sm:text-xl'}`}>Enter real roll</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full ${fullscreen ? 'border border-slate-400/25 bg-white/72 text-slate-900 px-2 py-1 text-[10px]' : 'border border-amber-200/25 bg-white/10 text-amber-50 px-3 py-1 text-xs'}`}>
              {rolling ? 'Rolling' : selectedManual}
            </span>
            <div className={standardDie}>
              {pipMap[rolling ? displayValue : selectedManual].map(([row, col], index) => (
                <span key={`${row}-${col}-${index}`} className={pipClass} style={{ gridRow: row, gridColumn: col }} />
              ))}
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-3 ${fullscreen ? 'gap-1.5' : 'gap-2'}`}>
          {[1, 2, 3, 4, 5, 6].map((face) => (
            <button
              key={face}
              type="button"
              onClick={() => setSelectedManual(face)}
              className={`border font-semibold transition ${fullscreen ? 'rounded-lg px-0 py-2 text-xs' : 'rounded-xl px-0 py-3 text-sm'} ${selectedManual === face ? 'border-amber-200/60 bg-amber-300 text-slate-950' : fullscreen ? 'border-slate-400/20 bg-white/65 text-slate-900 hover:bg-white/80' : 'border-white/10 bg-white/8 text-white hover:bg-white/12'}`}
            >
              {face}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onManualSubmit(selectedManual)}
          disabled={disabled}
          className={`mt-3 w-full rounded-2xl bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${fullscreen ? 'px-3 py-2.5 text-sm' : 'px-4 py-3 text-sm'}`}
        >
          {rolling ? 'Rolling chosen value...' : `Use ${selectedManual}`}
        </button>
      </div>
    );
  }

  return (
    <div className={standardShell}>
      {fullscreen ? (
        <>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-600">Dice</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">Roll to move</p>
            </div>
            <span className="rounded-full border border-slate-400/25 bg-white/72 px-2 py-1 text-[10px] text-slate-900">
              {rolling ? 'Rolling' : value ? `Rolled ${value}` : 'Ready'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: disabled ? 1 : 1.03 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              animate={rolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.08, 0.95, 1.02, 1] } : { rotate: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
              onClick={onRoll}
              disabled={disabled}
              className={`${standardDie} disabled:cursor-not-allowed disabled:opacity-80`}
              aria-label="Dice"
            >
              {pipMap[displayValue].map(([row, col], index) => (
                <span key={`${row}-${col}-${index}`} className={pipClass} style={{ gridRow: row, gridColumn: col }} />
              ))}
            </motion.button>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-950">{rolling ? 'Dice tumbling' : value ? `Current roll ${value}` : 'Tap roll to start'}</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-600">This side panel stays off the main path.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRoll}
            disabled={disabled}
            className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {rolling ? 'Shaking...' : 'Roll'}
          </button>
        </>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">Dice</p>
              <p className="font-display text-lg font-semibold text-white sm:text-xl">Roll to move</p>
            </div>
            <span className="rounded-full border border-amber-200/25 bg-white/10 px-3 py-1 text-xs text-amber-50">
              {rolling ? 'Rolling...' : value ? `Rolled ${value}` : 'Ready'}
            </span>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-stretch">
            <motion.button
              type="button"
              whileHover={{ scale: disabled ? 1 : 1.03 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              animate={rolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.08, 0.95, 1.02, 1] } : { rotate: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
              onClick={onRoll}
              disabled={disabled}
              className={`${standardDie} disabled:cursor-not-allowed disabled:opacity-80`}
              aria-label="Dice"
            >
              {pipMap[displayValue].map(([row, col], index) => (
                <span key={`${row}-${col}-${index}`} className={pipClass} style={{ gridRow: row, gridColumn: col }} />
              ))}
            </motion.button>

            <div className="flex w-full flex-1 flex-col justify-between gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                {rolling ? 'Die is tumbling through several faces before landing.' : value ? `Current roll: ${value}` : 'Tap the dice or the button to roll.'}
              </div>
              <button
                type="button"
                onClick={onRoll}
                disabled={disabled}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rolling ? 'Shaking the dice...' : 'Roll the dice'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
