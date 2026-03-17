import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';
import { ToastMessage } from '../types/game';

type ToastStackProps = {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
};

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
};

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        onDismiss(toast.id);
      }, 3200),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [onDismiss, toasts]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.tone];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 18, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 18, scale: 0.96 }}
              className="pointer-events-auto rounded-2xl border border-white/15 bg-slate-950/70 p-4 text-white shadow-glass backdrop-blur-xl"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-white/10 p-2">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  <p className="text-sm text-slate-300">{toast.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
