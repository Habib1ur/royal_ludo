import { Bot, Crown, Star, UserRound } from 'lucide-react';
import { PLAYER_META } from '../constants/players';
import { PlayerConfig, Token } from '../types/game';

type PlayerPanelProps = {
  player: PlayerConfig;
  tokens: Token[];
  isActive: boolean;
  isWinner: boolean;
  performanceMode?: boolean;
};

export function PlayerPanel({ player, tokens, isActive, isWinner, performanceMode = false }: PlayerPanelProps) {
  const meta = PLAYER_META[player.color];
  const finished = tokens.filter((token) => token.state === 'finished').length;
  const atHome = tokens.filter((token) => token.state === 'home').length;

  return (
    <section
      className={`rounded-[2rem] border p-4 transition ${performanceMode ? (isActive ? 'border-white/20 bg-slate-900/92 shadow-[0_8px_18px_rgba(15,23,42,0.14)]' : 'border-white/8 bg-slate-900/82 shadow-[0_6px_14px_rgba(15,23,42,0.12)]') : (isActive ? 'border-white/30 bg-white/15 shadow-glass backdrop-blur-xl ring-1 ring-white/20' : 'border-white/10 bg-white/10 shadow-glass backdrop-blur-xl')} ${!player.enabled ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold text-slate-950"
            style={{ background: `linear-gradient(135deg, ${meta.soft}, ${meta.color})` }}
          >
            {player.avatar}
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-white">{player.name}</p>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span>{player.enabled ? meta.label : 'Waiting seat'}</span>
              {player.enabled ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-slate-200">
                  {player.kind === 'ai' ? <Bot className="h-3 w-3" /> : <UserRound className="h-3 w-3" />}
                  {player.kind}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {isWinner ? (
          <div className="rounded-full bg-amber-400/20 p-2 text-amber-300">
            <Crown className="h-4 w-4" />
          </div>
        ) : isActive ? (
          <div className="rounded-full bg-white/10 p-2 text-white">
            <Star className="h-4 w-4" />
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className={`rounded-2xl border p-3 ${performanceMode ? 'border-white/8 bg-slate-950/68' : 'border-white/10 bg-slate-950/30'}`}>
          <p className="text-slate-400">Finished</p>
          <p className="mt-1 text-xl font-semibold text-white">{finished}/4</p>
        </div>
        <div className={`rounded-2xl border p-3 ${performanceMode ? 'border-white/8 bg-slate-950/68' : 'border-white/10 bg-slate-950/30'}`}>
          <p className="text-slate-400">At Home</p>
          <p className="mt-1 text-xl font-semibold text-white">{atHome}</p>
        </div>
      </div>
    </section>
  );
}
