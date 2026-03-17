import { Modal } from './Modal';

type RulesDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function RulesDialog({ open, onClose }: RulesDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="How Royal Ludo Works">
      <div className="space-y-3">
        <p>Roll a 6 to bring a token out of home. Rolling a 6 also grants an extra turn.</p>
        <p>After rolling, select one highlighted token. Illegal moves are blocked automatically.</p>
        <p>Landing on an opponent on a non-safe cell captures that token and sends it home.</p>
        <p>Safe cells cannot be captured. Exact roll is required to enter the final home.</p>
        <p>The first player to finish all four tokens wins.</p>
      </div>
    </Modal>
  );
}
