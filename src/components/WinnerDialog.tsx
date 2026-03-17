import { Sparkles } from 'lucide-react';
import { PLAYER_META } from '../constants/players';
import { PlayerColor } from '../types/game';
import { Modal } from './Modal';

type WinnerDialogProps = {
  winner: PlayerColor | null;
  open: boolean;
  onReplay: () => void;
  onLobby: () => void;
};

export function WinnerDialog({ winner, open, onReplay, onLobby }: WinnerDialogProps) {
  const meta = winner ? PLAYER_META[winner] : null;

  return (
    <Modal
      open={open}
      onClose={onLobby}
      title="Match Complete"
      footer={
        <>
          <button
            type="button"
            onClick={onReplay}
            className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Replay match
          </button>
          <button
            type="button"
            onClick={onLobby}
            className="rounded-2xl border border-white/15 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Back to lobby
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-950"
          style={{ background: meta ? `linear-gradient(135deg, ${meta.soft}, ${meta.color})` : undefined }}
        >
          <Sparkles className="h-4 w-4" />
          {meta ? `${meta.label} takes the crown` : 'Winner declared'}
        </div>
        <p>
          {meta ? `${meta.label} finished all four tokens and claimed the board.` : 'A winner has been declared.'}
        </p>
      </div>
    </Modal>
  );
}
