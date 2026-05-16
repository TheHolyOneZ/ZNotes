import { Edit2, Pin, Trash2, Bell, Tag, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { TagBadge } from "../ui/TagBadge";
import { ProgressBar } from "../ui/ProgressBar";
import { PRIORITY_COLORS } from "../../lib/constants";
import { useChecklistsStore } from "../../store/checklists";
import { formatDate, checklistProgress } from "../../lib/utils";
import type { Checklist } from "../../types";

interface ChecklistViewModalProps {
  open: boolean;
  checklist: Checklist | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}

export function ChecklistViewModal({ open, checklist, onClose, onEdit, onDelete, onPin }: ChecklistViewModalProps) {
  const toggleItem = useChecklistsStore((s) => s.toggleItem);
  if (!checklist) return null;

  const progress = checklistProgress(checklist.items);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 glass-modal-overlay"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl glass-modal rounded-[var(--radius-xl)] shadow-2xl flex flex-col max-h-[80vh]"
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-white/[0.07]">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                  {checklist.title}
                </h2>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {checklist.category && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "rgba(var(--accent-rgb),0.12)", color: "var(--accent)" }}>
                      {checklist.category}
                    </span>
                  )}
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    Updated {formatDate(checklist.updated_at)}
                  </span>
                  {checklist.scheduled_date && (
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                      <Calendar size={10} /> {new Date(checklist.scheduled_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                  {checklist.reminder && (
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--accent)" }}>
                      <Bell size={10} /> {new Date(checklist.reminder).toLocaleString()}
                    </span>
                  )}
                  {checklist.pinned && (
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--accent)" }}>
                      <Pin size={10} /> Pinned
                    </span>
                  )}
                </div>
                {checklist.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Tag size={10} style={{ color: "var(--text-muted)" }} className="mt-0.5" />
                    {checklist.tags.map((t) => <TagBadge key={t} tag={t} small />)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={onPin} title={checklist.pinned ? "Unpin" : "Pin"}>
                  <Pin size={13} style={{ color: checklist.pinned ? "var(--accent)" : "var(--text-muted)" }} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { onDelete(); onClose(); }}>
                  <Trash2 size={13} style={{ color: "var(--text-muted)" }} />
                </Button>
                <Button variant="accent" size="sm" onClick={onEdit}>
                  <Edit2 size={13} /> Edit
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {checklist.items.length === 0 ? (
                <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>No items in this checklist.</p>
              ) : (
                <div className="space-y-0">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {checklist.items.filter((i) => i.completed).length} / {checklist.items.length} completed
                      </span>
                      <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>{progress}%</span>
                    </div>
                    <ProgressBar value={progress} />
                  </div>
                  <div className="space-y-2">
                    {checklist.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(checklist.id, item.id, !item.completed)}
                        className="w-full flex items-center gap-3 py-2 px-3 rounded-[var(--radius-sm)] text-left hover:bg-white/[0.04] transition-colors group"
                      >
                        <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.completed ? "border-emerald-500 bg-emerald-500/20" : "border-white/20 group-hover:border-white/40"}`}>
                          {item.completed && (
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                              <path d="M1 3L3 5L7 1" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm flex-1 transition-all ${item.completed ? "line-through" : ""}`}
                          style={{ color: item.completed ? "var(--text-muted)" : "var(--text-secondary)" }}>
                          {item.text}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS] ?? "transparent" }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
