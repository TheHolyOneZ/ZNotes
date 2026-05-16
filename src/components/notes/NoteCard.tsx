import { Pin, Edit2, Trash2, Bell, MoreVertical } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { TagBadge } from "../ui/TagBadge";
import { MenuBtn } from "../ui/MenuBtn";
import type { Note } from "../../types";
import { formatDate } from "../../lib/utils";

interface NoteCardProps {
  note: Note;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}

export function NoteCard({ note, onOpen, onEdit, onDelete, onPin }: NoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const borderStyle = useMemo(
    () => note.color ? { borderColor: `${note.color}30`, boxShadow: `0 0 20px ${note.color}10` } : {},
    [note.color]
  );

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
      <GlassCard variant="sm" hover className="relative p-4 group" style={borderStyle} onClick={onOpen}>
        {note.pinned && (
          <div className="absolute top-3 right-10">
            <Pin size={12} className="rotate-45" style={{ color: "var(--accent)" }} />
          </div>
        )}

        {note.color && (
          <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background: note.color }} />
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
                className="glass-md absolute right-0 top-8 min-w-[130px] rounded-xl py-1 z-20 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <MenuBtn icon={<Edit2 size={12} />} label="Edit" onClick={() => { setMenuOpen(false); onEdit(); }} />
                <MenuBtn icon={<Pin size={12} />} label={note.pinned ? "Unpin" : "Pin"} onClick={() => { setMenuOpen(false); onPin(); }} />
                <MenuBtn icon={<Trash2 size={12} />} label="Delete" onClick={() => { setMenuOpen(false); onDelete(); }} danger />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h3 className="font-semibold text-sm mb-1 pr-8 truncate" style={{ color: "var(--text-primary)" }}>
          {note.title}
        </h3>

        {note.content && (
          <p className="text-xs line-clamp-2 mb-2.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {note.content}
          </p>
        )}

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {note.tags.slice(0, 3).map((t) => <TagBadge key={t} tag={t} small />)}
            {note.tags.length > 3 && <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>+{note.tags.length - 3}</span>}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{formatDate(note.updated_at)}</span>
          {note.reminder && (
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--accent)" }}>
              <Bell size={10} /> {new Date(note.reminder).toLocaleDateString()}
            </span>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
