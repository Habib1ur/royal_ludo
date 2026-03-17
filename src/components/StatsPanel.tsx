import { BarChart3 } from 'lucide-react';
import { PLAYER_META, PLAYER_ORDER } from '../constants/players';
import { MatchStats, PlayerConfig } from '../types/game';

type StatsPanelProps = {
  stats: MatchStats;
  players: PlayerConfig[];
};

export function StatsPanel({ stats, players }: StatsPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-glass backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-full bg-white/10 p-2 text-white">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Stats</p>
          <h2 className="font-display text-xl font-semibold text-white">Match summary</h2>
        </div>
      </div>
      <div className="grid gap-3">
        {PLAYER_ORDER.map((color) => {
          const player = players.find((entry) => entry.color === color)!;
          const meta = PLAYER_META[color];
          const stat = stats[color];
          return (
            <div key={color} className="rounded-2xl border border-white/10 bg-slate-950/30 p-3 text-sm text-slate-200">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-white">{player.name}</span>
                <span className="rounded-full px-2 py-1 text-xs font-semibold text-slate-950" style={{ background: meta.soft }}>
                  {player.kind === 'ai' ? 'AI' : 'Human'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs uppercase tracking-[0.2em] text-slate-300">
                <span>Turns {stat.turns}</span>
                <span>Captures {stat.captures}</span>
                <span>Finishes {stat.finishes}</span>
                <span>Rolls {stat.rolls}</span>
                <span>Sixes {stat.sixes}</span>
                <span>Moves {stat.moves}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
