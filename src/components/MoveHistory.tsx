import { Clock3 } from 'lucide-react';
import { MoveHistoryEntry } from '../types/game';

type MoveHistoryProps = {
  entries: MoveHistoryEntry[];
};

export function MoveHistory({ entries }: MoveHistoryProps) {
  return (
    <section className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-glass backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-full bg-white/10 p-2">
          <Clock3 className="h-4 w-4 text-slate-100" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">History</p>
          <h2 className="font-display text-xl font-semibold text-white">Recent moves</h2>
        </div>
      </div>

      <div className="max-h-[22rem] space-y-3 overflow-auto pr-1">
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-4 text-sm text-slate-300">
            Rolls, captures, and wins show up here.
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-3 text-sm">
              <p className="font-medium text-white">{entry.message}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                Turn {entry.turn} • {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
