import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { PerformanceMode } from '../types/game';

type DiceProps = {
  value: number | null;
  rolling: boolean;
  disabled: boolean;
  manualMode: boolean;
  fullscreen?: boolean;
  minimalFullscreen?: boolean;
  mobileViewport?: boolean;
  performanceMode?: PerformanceMode;
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


function FullscreenManualDice({
  selectedManual,
  displayValue,
  rolling,
  disabled,
  mobileViewport,
  performanceMode,
  onManualSubmit,
}: {
  selectedManual: number;
  displayValue: number;
  rolling: boolean;
  disabled: boolean;
  mobileViewport?: boolean;
  performanceMode?: PerformanceMode;
  onManualSubmit: (value: number) => void;
}) {
  const [manualPickerOpen, setManualPickerOpen] = useState(false);
  const isPerformance = performanceMode !== 'off';
  const isUltra = performanceMode === 'ultra';

  useEffect(() => {
    if (rolling) {
      setManualPickerOpen(false);
    }
  }, [rolling]);

  return (
    <>
      <div>
        <motion.button
          type="button"
          whileTap={{ scale: manualPickerOpen ? 1 : 0.98 }}
          onClick={() => {
            if (!disabled && !manualPickerOpen) {
              setManualPickerOpen(true);
            }
          }}
          aria-disabled={disabled}
          className={`relative grid shrink-0 grid-cols-3 grid-rows-3 border ${isUltra && mobileViewport ? 'h-12 w-12 rounded-[0.85rem] p-1.5' : 'h-16 w-16 rounded-[1.1rem] p-2.5 sm:h-20 sm:w-20 sm:rounded-[1.2rem] sm:p-3'} ${isUltra ? 'border-slate-300 bg-white shadow-none' : isPerformance ? 'border-slate-300 bg-white shadow-[0_4px_10px_rgba(15,23,42,0.12)]' : 'border-slate-900/15 bg-gradient-to-br from-white via-slate-100 to-slate-300 shadow-xl'} ${disabled ? 'opacity-80' : ''}`}
          aria-label="Choose manual dice value"
        >
          {pipMap[rolling ? displayValue : selectedManual].map(([row, col], index) => (
            <span
              key={`${row}-${col}-${index}`}
              className="m-auto h-2.5 w-2.5 rounded-full bg-slate-900 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] sm:h-3 sm:w-3"
              style={{ gridRow: row, gridColumn: col }}
            />
          ))}
        </motion.button>
      </div>

      {manualPickerOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dice picker"
            className="absolute inset-0 bg-white/10 backdrop-blur-[3px]"
            onClick={() => setManualPickerOpen(false)}
          />
          <div className={`relative z-10 grid w-[min(20rem,calc(100vw-2rem))] grid-cols-3 gap-2 rounded-[1.8rem] border p-3 sm:w-72 sm:gap-3 sm:p-4 ${isUltra ? 'border-slate-300 bg-white shadow-none' : isPerformance ? 'border-slate-300 bg-white shadow-[0_10px_20px_rgba(15,23,42,0.12)]' : 'border-white/55 bg-white/75 shadow-[0_24px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl'}`}>
            {[1, 2, 3, 4, 5, 6].map((face) => (
              <button
                key={face}
                type="button"
                onClick={() => {
                  setManualPickerOpen(false);
                  onManualSubmit(face);
                }}
                className={`rounded-xl border px-0 py-3 text-base font-semibold transition sm:py-4 sm:text-lg ${selectedManual === face ? 'border-amber-200/70 bg-amber-300 text-slate-950 shadow-[0_10px_24px_rgba(245,158,11,0.18)]' : 'border-slate-300/45 bg-white/70 text-slate-900 hover:bg-white/90'}`}
              >
                {face}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function Dice({
  value,
  rolling,
  disabled,
  manualMode,
  fullscreen = false,
  minimalFullscreen = false,
  mobileViewport = false,
  performanceMode = 'off',
  onRoll,
  onManualSubmit,
}: DiceProps) {
  const [displayValue, setDisplayValue] = useState(value ?? 1);
  const [selectedManual, setSelectedManual] = useState<number>(1);
  const isPerformance = performanceMode !== 'off';
  const isUltra = performanceMode === 'ultra';

  useEffect(() => {
    if (!rolling) {
      setDisplayValue(value ?? 1);
      return;
    }

    let frame = 0;
    const interval = window.setInterval(() => {
      frame += 1;
      setDisplayValue(((frame % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6);
    }, isUltra ? 130 : 95);

    return () => window.clearInterval(interval);
  }, [isUltra, rolling, value]);

  const standardShell = fullscreen
    ? isUltra
      ? 'rounded-[1.2rem] border border-slate-300 bg-white p-3 text-slate-950 shadow-none'
      : isPerformance
        ? 'rounded-[1.4rem] border border-slate-300 bg-white p-3 text-slate-950 shadow-[0_8px_18px_rgba(15,23,42,0.12)]'
      : 'rounded-[1.4rem] border border-slate-200/70 bg-[linear-gradient(165deg,rgba(248,250,252,0.97),rgba(226,232,240,0.94)_54%,rgba(203,213,225,0.9)_100%)] p-3 text-slate-950 shadow-[0_16px_30px_rgba(15,23,42,0.22)] backdrop-blur-md'
    : isPerformance
      ? 'rounded-[2rem] border border-white/10 bg-slate-900/92 p-3 text-white shadow-[0_8px_18px_rgba(15,23,42,0.16)] min-[1000px]:p-4 xl:p-5'
      : 'rounded-[2rem] border border-amber-200/30 bg-[linear-gradient(160deg,rgba(15,23,42,0.96),rgba(30,41,59,0.94))] p-3 text-white shadow-[0_18px_50px_rgba(15,23,42,0.35)] min-[1000px]:p-4 xl:p-5';
  const manualShell = fullscreen
    ? isUltra
      ? 'rounded-[1.2rem] border border-slate-300 bg-white p-3 text-slate-950 shadow-none'
      : isPerformance
        ? 'rounded-[1.4rem] border border-slate-300 bg-white p-3 text-slate-950 shadow-[0_8px_18px_rgba(15,23,42,0.12)]'
      : 'rounded-[1.4rem] border border-slate-200/70 bg-[linear-gradient(165deg,rgba(248,250,252,0.97),rgba(226,232,240,0.94)_54%,rgba(203,213,225,0.9)_100%)] p-3 text-slate-950 shadow-[0_16px_30px_rgba(15,23,42,0.22)] backdrop-blur-md'
    : isPerformance
      ? 'rounded-[2rem] border border-white/10 bg-slate-900/92 p-3 text-white shadow-[0_8px_18px_rgba(15,23,42,0.16)] min-[1000px]:p-4 xl:p-5'
      : 'rounded-[2rem] border border-amber-200/30 bg-[linear-gradient(160deg,rgba(15,23,42,0.96),rgba(30,41,59,0.94))] p-3 text-white shadow-[0_18px_50px_rgba(15,23,42,0.35)] min-[1000px]:p-4 xl:p-5';
  const standardDie = fullscreen
    ? isUltra
      ? mobileViewport
        ? 'relative grid h-12 w-12 shrink-0 grid-cols-3 grid-rows-3 rounded-[0.85rem] border border-slate-300 bg-white p-1.5 shadow-none'
        : 'relative grid h-16 w-16 shrink-0 grid-cols-3 grid-rows-3 rounded-[1rem] border border-slate-300 bg-white p-2.5 shadow-none sm:h-20 sm:w-20 sm:p-3'
      : isPerformance
        ? 'relative grid h-16 w-16 shrink-0 grid-cols-3 grid-rows-3 rounded-[1.1rem] border border-slate-300 bg-white p-2.5 shadow-[0_4px_10px_rgba(15,23,42,0.12)] sm:h-20 sm:w-20 sm:rounded-[1.2rem] sm:p-3'
      : 'relative grid h-16 w-16 shrink-0 grid-cols-3 grid-rows-3 rounded-[1.1rem] border border-slate-900/15 bg-gradient-to-br from-white via-slate-100 to-slate-300 p-2.5 shadow-xl sm:h-20 sm:w-20 sm:rounded-[1.2rem] sm:p-3'
    : isUltra
      ? 'relative grid h-16 w-16 shrink-0 grid-cols-3 grid-rows-3 rounded-[1rem] border border-slate-300 bg-white p-2.5 shadow-none min-[1000px]:h-20 min-[1000px]:w-20 min-[1000px]:rounded-[1.2rem] min-[1000px]:p-3 xl:h-24 xl:w-24 xl:p-4'
      : isPerformance
        ? 'relative grid h-16 w-16 shrink-0 grid-cols-3 grid-rows-3 rounded-[1.1rem] border border-slate-300 bg-white p-2.5 shadow-[0_6px_12px_rgba(15,23,42,0.14)] min-[1000px]:h-20 min-[1000px]:w-20 min-[1000px]:rounded-[1.4rem] min-[1000px]:p-3 xl:h-24 xl:w-24 xl:p-4'
      : 'relative grid h-16 w-16 shrink-0 grid-cols-3 grid-rows-3 rounded-[1.1rem] border border-slate-900/15 bg-gradient-to-br from-white via-slate-100 to-slate-300 p-2.5 shadow-2xl min-[1000px]:h-20 min-[1000px]:w-20 min-[1000px]:rounded-[1.4rem] min-[1000px]:p-3 xl:h-24 xl:w-24 xl:p-4';
  const pipClass = fullscreen
    ? 'm-auto h-2.5 w-2.5 rounded-full bg-slate-900 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] sm:h-3 sm:w-3'
    : 'm-auto h-2.5 w-2.5 rounded-full bg-slate-900 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] min-[1000px]:h-3 min-[1000px]:w-3 xl:h-3.5 xl:w-3.5';



  if (fullscreen && minimalFullscreen && manualMode) {
    return (
      <FullscreenManualDice
        selectedManual={selectedManual}
        displayValue={displayValue}
        rolling={rolling}
        disabled={disabled}
        mobileViewport={mobileViewport}
        performanceMode={performanceMode}
        onManualSubmit={(manualValue) => {
          setSelectedManual(manualValue);
          onManualSubmit(manualValue);
        }}
      />
    );
  }

  if (fullscreen && minimalFullscreen && !manualMode) {
    return (
      <motion.button
        type="button"
        whileHover={{ scale: disabled ? 1 : 1.03 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        animate={rolling && !isUltra ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.08, 0.95, 1.02, 1] } : { rotate: 0, scale: 1 }}
        transition={isUltra ? { duration: 0.05 } : { duration: 0.9, ease: 'easeInOut' }}
        disabled={disabled}
        className={`${standardDie} disabled:cursor-not-allowed disabled:opacity-80`}
        aria-label="Roll dice"
        onClick={onRoll}
      >
        {pipMap[displayValue].map(([row, col], index) => (
          <span key={`${row}-${col}-${index}`} className={pipClass} style={{ gridRow: row, gridColumn: col }} />
        ))}
      </motion.button>
    );
  }

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
              animate={rolling && !isUltra ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.08, 0.95, 1.02, 1] } : { rotate: 0, scale: 1 }}
              transition={isUltra ? { duration: 0.05 } : { duration: 0.9, ease: 'easeInOut' }}
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
              animate={rolling && !isUltra ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.08, 0.95, 1.02, 1] } : { rotate: 0, scale: 1 }}
              transition={isUltra ? { duration: 0.05 } : { duration: 0.9, ease: 'easeInOut' }}
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

