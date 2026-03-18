import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Dices, Play, RotateCcw, Settings2, Sparkles, TimerReset, Users, Volume2 } from 'lucide-react';
import { PLAYER_META, PLAYER_ORDER } from '../constants/players';
import { GameOptions, PlayerConfig } from '../types/game';
import { isPlayerEnabledForCount } from '../utils/game';

type StartScreenProps = {
  playerCount: 2 | 3 | 4;
  players: PlayerConfig[];
  options: GameOptions;
  canResume: boolean;
  onPlayerCountChange: (count: 2 | 3 | 4) => void;
  onPlayerChange: (color: PlayerConfig['color'], patch: Partial<PlayerConfig>) => void;
  onOptionsChange: (patch: Partial<GameOptions>) => void;
  onStart: () => void;
  onResume: () => void;
  onClearSaved: () => void;
};

export function StartScreen({
  playerCount,
  players,
  options,
  canResume,
  onPlayerCountChange,
  onPlayerChange,
  onOptionsChange,
  onStart,
  onResume,
  onClearSaved,
}: StartScreenProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#1d4ed8_0%,#091221_44%,#050912_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-[size:14rem_14rem,2.2rem_2.2rem,2.2rem_2.2rem] opacity-20" />
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-rose-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-12 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

      <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center gap-10 px-4 py-12 lg:flex-row lg:items-center">
        <section className="max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100 backdrop-blur-lg">
            <Users className="h-4 w-4" />
            Premium local multiplayer
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-6 font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
            Royal Ludo
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 max-w-xl text-lg leading-8 text-slate-200">
            Full-screen board play, AI-ready seats, timer mode, undo support, sound hooks, secure randomness, and optional offline dice entry.
          </motion.p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[2, 3, 4].map((count) => (
              <button key={count} type="button" onClick={() => onPlayerCountChange(count as 2 | 3 | 4)} className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${playerCount === count ? 'border-white/30 bg-white/15 shadow-glass' : 'border-white/10 bg-white/8 hover:bg-white/10'}`}>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Mode</p>
                <p className="mt-2 font-display text-2xl font-semibold text-white">{count} Players</p>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-glass backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <p className="font-display text-xl font-semibold">Match options</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <button type="button" onClick={() => onOptionsChange({ autoMoveSingle: !options.autoMoveSingle })} className={`rounded-[1.3rem] border px-4 py-4 text-left transition ${options.autoMoveSingle ? 'border-white/30 bg-white/15' : 'border-white/10 bg-white/5'}`}>
                <p className="text-sm font-semibold text-white">Auto move</p>
                <p className="mt-1 text-sm text-slate-300">Move the only legal pawn automatically.</p>
              </button>
              <button
                type="button"
                onClick={() =>
                  onOptionsChange({
                    performanceMode:
                      options.performanceMode === 'off'
                        ? 'basic'
                        : options.performanceMode === 'basic'
                          ? 'ultra'
                          : 'off',
                  })
                }
                className={`rounded-[1.3rem] border px-4 py-4 text-left transition ${
                  options.performanceMode === 'basic'
                    ? 'border-emerald-300/45 bg-emerald-400/10'
                    : options.performanceMode === 'ultra'
                      ? 'border-sky-300/45 bg-sky-400/10'
                      : 'border-white/10 bg-white/5'
                }`}
              >
                <p className="text-sm font-semibold text-white">Performance mode</p>
                <p className="mt-1 text-sm text-slate-300">
                  {options.performanceMode === 'off'
                    ? 'Performance mode is off'
                    : options.performanceMode === 'basic'
                      ? 'Performance mode 1 activated'
                      : 'Performance mode 2 activated'}
                </p>
              </button>
              <button type="button" onClick={() => onOptionsChange({ showHints: !options.showHints })} className={`rounded-[1.3rem] border px-4 py-4 text-left transition ${options.showHints ? 'border-white/30 bg-white/15' : 'border-white/10 bg-white/5'}`}>
                <p className="text-sm font-semibold text-white">Move hints</p>
                <p className="mt-1 text-sm text-slate-300">Highlight playable pawns on the board.</p>
              </button>
              <button
                type="button"
                onClick={() => onOptionsChange({ turnTimerSeconds: options.turnTimerSeconds === 0 ? 15 : options.turnTimerSeconds === 15 ? 30 : 0 })}
                className={`rounded-[1.3rem] border px-4 py-4 text-left transition ${
                  options.turnTimerSeconds === 15
                    ? 'border-emerald-300/45 bg-emerald-400/10'
                    : options.turnTimerSeconds === 30
                      ? 'border-sky-300/45 bg-sky-400/10'
                      : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 text-white"><TimerReset className="h-4 w-4" /><p className="text-sm font-semibold">Turn timer</p></div>
                <p className="mt-1 text-sm text-slate-300">
                  {options.turnTimerSeconds === 0
                    ? 'Turn timer is off'
                    : options.turnTimerSeconds === 15
                      ? '15 second timer activated'
                      : '30 second timer activated'}
                </p>
              </button>
              <button type="button" onClick={() => onOptionsChange({ soundsEnabled: !options.soundsEnabled })} className={`rounded-[1.3rem] border px-4 py-4 text-left transition ${options.soundsEnabled ? 'border-white/30 bg-white/15' : 'border-white/10 bg-white/5'}`}>
                <div className="flex items-center gap-2 text-white"><Volume2 className="h-4 w-4" /><p className="text-sm font-semibold">Sounds</p></div>
                <p className="mt-1 text-sm text-slate-300">Enable dice, move, capture, and win tones.</p>
              </button>
              <button type="button" onClick={() => onOptionsChange({ manualDiceInput: !options.manualDiceInput })} className={`rounded-[1.3rem] border px-4 py-4 text-left transition ${options.manualDiceInput ? 'border-white/30 bg-white/15' : 'border-white/10 bg-white/5'}`}>
                <div className="flex items-center gap-2 text-white"><Dices className="h-4 w-4" /><p className="text-sm font-semibold">Offline dice</p></div>
                <p className="mt-1 text-sm text-slate-300">Enter the real dice number manually instead of rolling on screen.</p>
              </button>
            </div>
          </div>
        </section>

        <motion.section initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-2xl rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-glass backdrop-blur-2xl">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Lobby</p>
              <h2 className="font-display text-2xl font-semibold text-white">Set up the match</h2>
            </div>
            <AnimatePresence>
              {canResume ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <button type="button" onClick={onResume} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/15">
                    Resume saved game
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="grid gap-4">
            {PLAYER_ORDER.map((color, index) => {
              const player = players.find((entry) => entry.color === color)!;
              const meta = PLAYER_META[color];
              const enabled = isPlayerEnabledForCount(color, playerCount);

              return (
                <div key={color} className={`rounded-[1.5rem] border p-4 transition ${enabled ? 'border-white/15 bg-slate-950/30' : 'border-white/10 bg-slate-950/20 opacity-60'}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold text-slate-950" style={{ background: `linear-gradient(135deg, ${meta.soft}, ${meta.color})` }}>
                        {player.avatar}
                      </div>
                      <div>
                        <p className="font-display text-lg font-semibold text-white">{meta.label}</p>
                        <p className="text-sm text-slate-300">{enabled ? 'Active in this match' : 'Disabled seat'}</p>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(event) => onPlayerChange(color, { name: event.target.value })}
                      maxLength={18}
                      disabled={!enabled}
                      className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-white/25"
                      placeholder={`Name for ${meta.label}`}
                      aria-label={`${meta.label} player name`}
                    />
                    {enabled ? (
                      <button type="button" onClick={() => onPlayerChange(color, { kind: player.kind === 'human' ? 'ai' : 'human' })} className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm transition ${player.kind === 'ai' ? 'border-white/25 bg-white/12 text-white' : 'border-white/10 bg-white/5 text-slate-200'}`}>
                        <Bot className="h-4 w-4" />
                        {player.kind === 'ai' ? 'AI seat' : 'Human seat'}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={onStart} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 px-5 py-3 font-semibold text-slate-950 transition hover:brightness-110">
              <Play className="h-4 w-4" />
              Start game
            </button>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <Sparkles className="h-4 w-4" />
              {playerCount === 2
                ? 'Two-player mode uses opposite houses: Red and Yellow'
                : options.manualDiceInput
                  ? 'Offline dice entry enabled'
                  : 'Secure dice randomness enabled'}
            </div>
            {canResume ? (
              <button type="button" onClick={onClearSaved} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
                <RotateCcw className="h-4 w-4" />
                Clear saved game
              </button>
            ) : null}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
