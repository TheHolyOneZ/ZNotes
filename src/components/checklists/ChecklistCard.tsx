import { useState, useMemo } from "react";
import { Pin, Edit2, Trash2, Bell, Calendar, MoreVertical, Plus, ArrowDownToLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { TagBadge } from "../ui/TagBadge";
import { ProgressBar } from "../ui/ProgressBar";
import { MenuBtn } from "../ui/MenuBtn";
import type { Checklist } from "../../types";
import { formatDate, checklistProgress, isToday, isPast } from "../../lib/utils";
import { PRIORITY_COLORS } from "../../lib/constants";
import { useChecklistsStore } from "../../store/checklists";

interface ChecklistCardProps {
  checklist: Checklist;
  onOpen?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}

export function ChecklistCard({ checklist, onOpen, onEdit, onDelete, onPin }: ChecklistCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [addText, setAddText] = useState("");
  const { toggleItem, addItem, pullToToday } = useChecklistsStore();

  const progress = useMemo(() => checklistProgress(checklist.items), [checklist.items]);
  const isScheduledToday = useMemo(() => isToday(checklist.scheduled_date), [checklist.scheduled_date]);
  const isPastDue = useMemo(() => isPast(checklist.scheduled_date), [checklist.scheduled_date]);

  const handleAddItem = async () => {
    if (!addText.trim()) return;
    await addItem({ checklist_id: checklist.id, text: addText.trim(), priority: "medium" });
    setAddText("");
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
      <GlassCard variant="sm" hover={!!onOpen} className="p-4 relative group" onClick={onOpen}>
        {checklist.scheduled_date && (
          <div className={`absolute top-3 left-3 flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${isScheduledToday ? "bg-emerald-500/20 text-emerald-400" : isPastDue ? "bg-rose-500/20 text-rose-400" : "bg-white/[0.08] text-white/40"}`}>
            <Calendar size={9} />
            {isScheduledToday ? "Today" : isPastDue ? "Overdue" : checklist.scheduled_date}
          </div>
        )}

        <div className="absolute top-2.5 right-2.5 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
            style={{ color: "var(--text-muted)" }}
          >
            <MoreVertical size={14} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-md absolute right-0 top-8 min-w-[150px] rounded-xl py-1 z-20 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <MenuBtn icon={<Edit2 size={12} />} label="Edit" onClick={() => { setMenuOpen(false); onEdit(); }} />
                <MenuBtn icon={<Pin size={12} />} label={checklist.pinned ? "Unpin" : "Pin"} onClick={() => { setMenuOpen(false); onPin(); }} />
                {checklist.scheduled_date && !isScheduledToday && (
                  <MenuBtn icon={<ArrowDownToLine size={12} />} label="Pull to Today" onClick={() => { setMenuOpen(false); pullToToday(checklist.id); }} />
                )}
                <MenuBtn icon={<Trash2 size={12} />} label="Delete" onClick={() => { setMenuOpen(false); onDelete(); }} danger />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={checklist.scheduled_date ? "mt-5" : ""}>
          <div className="flex items-start gap-2 pr-8">
            <div className="flex-1">
              <h3 className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                {checklist.title}
              </h3>
              {checklist.category && (
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{checklist.category}</span>
              )}
            </div>
            {checklist.pinned && <Pin size={11} className="rotate-45 flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />}
          </div>
        </div>

        {checklist.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {checklist.tags.slice(0, 3).map((t) => <TagBadge key={t} tag={t} small />)}
          </div>
        )}

        <div className="mt-3">
          <ProgressBar value={progress} showLabel />
        </div>

        {checklist.items.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {checklist.items.map((item) => (
              <button
                key={item.id}
                onClick={(e) => { e.stopPropagation(); toggleItem(checklist.id, item.id, !item.completed); }}
                className="w-full flex items-center gap-2.5 py-1 group/item text-left"
              >
                <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.completed ? "border-emerald-500 bg-emerald-500/20" : "border-white/20 group-hover/item:border-white/40"}`}>
                  {item.completed && <Checkmark />}
                </div>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLORS[item.priority] }} />
                <span className={`text-xs flex-1 transition-all ${item.completed ? "line-through" : ""}`}
                  style={{ color: item.completed ? "var(--text-muted)" : "var(--text-secondary)" }}>
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 flex gap-1.5">
          <input
            value={addText}
            onChange={(e) => setAddText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddItem(); }}
            placeholder="Quick add item..."
            className="flex-1 glass-input px-2.5 py-1.5 rounded-lg text-xs"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); handleAddItem(); }}
            disabled={!addText.trim()}
            className="px-2 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30"
            style={{ color: "var(--accent)" }}
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.06]">
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {checklist.items.filter((i) => i.completed).length}/{checklist.items.length} done
          </span>
          <div className="flex items-center gap-2">
            {checklist.reminder && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--accent)" }}>
                <Bell size={9} /> {new Date(checklist.reminder).toLocaleDateString()}
              </span>
            )}
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{formatDate(checklist.created_at)}</span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function Checkmark() {
  return (
    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
      <path d="M1 3L3 5L7 1" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
