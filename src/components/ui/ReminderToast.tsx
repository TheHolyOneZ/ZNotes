import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X, Clock, FileText, CheckSquare } from "lucide-react";
import { useToastStore, snoozeReminder, clearReminder } from "../../lib/notifications";
import type { ReminderToast } from "../../lib/notifications";

const SNOOZE_OPTIONS = [
  { label: "10 min", minutes: 10 },
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
];

function Toast({ toast, onNavigate }: { toast: ReminderToast; onNavigate?: (kind: string, id: string) => void }) {
  const dismiss = useToastStore((s) => s.dismiss);


  useEffect(() => {
    const t = setTimeout(() => dismiss(toast.id), 12_000);
    return () => clearTimeout(t);
  }, [toast.id, dismiss]);

  const handleSnooze = async (minutes: number) => {
    dismiss(toast.id);
    await snoozeReminder(toast.kind, toast.itemId, minutes);
  };

  const handleDismiss = async () => {
    dismiss(toast.id);
    await clearReminder(toast.kind, toast.itemId);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="glass-modal rounded-[var(--radius-lg)] shadow-2xl overflow-hidden w-80"
      style={{ border: "1px solid rgba(var(--accent-rgb),0.2)" }}
    >

      <div className="h-0.5 w-full" style={{ background: "var(--accent)" }} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "rgba(var(--accent-rgb),0.15)" }}>
            {toast.kind === "note"
              ? <FileText size={14} style={{ color: "var(--accent)" }} />
              : <CheckSquare size={14} style={{ color: "var(--accent)" }} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Bell size={10} style={{ color: "var(--accent)" }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                Reminder
              </span>
            </div>
            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{toast.title}</p>
            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--text-muted)" }}>{toast.body}</p>
          </div>
          <button onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors flex-shrink-0">
            <X size={12} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          <Clock size={10} style={{ color: "var(--text-muted)" }} />
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Snooze:</span>
          {SNOOZE_OPTIONS.map(({ label, minutes }) => (
            <button key={minutes} onClick={() => handleSnooze(minutes)}
              className="text-[10px] px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors font-medium"
              style={{ color: "var(--accent)", border: "1px solid rgba(var(--accent-rgb),0.2)" }}>
              {label}
            </button>
          ))}
          {onNavigate && (
            <button onClick={() => { onNavigate(toast.kind, toast.itemId); dismiss(toast.id); }}
              className="text-[10px] px-2 py-0.5 rounded-md ml-auto transition-colors font-medium"
              style={{ background: "var(--accent)", color: "white" }}>
              Open
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface ReminderToastContainerProps {
  onNavigate?: (kind: string, id: string) => void;
}

export function ReminderToastContainer({ onNavigate }: ReminderToastContainerProps) {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed bottom-4 right-4 z-[500] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onNavigate={onNavigate} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
