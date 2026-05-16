import { Edit2, Pin, Trash2, Bell, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { TagBadge } from "../ui/TagBadge";
import type { Note } from "../../types";
import { formatDate } from "../../lib/utils";

interface NoteViewModalProps {
  open: boolean;
  note: Note | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}

export function NoteViewModal({ open, note, onClose, onEdit, onDelete, onPin }: NoteViewModalProps) {
  if (!note) return null;

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
            {note.color && (
              <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full" style={{ background: note.color }} />
            )}


            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-white/[0.07]">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                  {note.title}
                </h2>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    Updated {formatDate(note.updated_at)}
                  </span>
                  {note.reminder && (
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--accent)" }}>
                      <Bell size={10} /> {new Date(note.reminder).toLocaleString()}
                    </span>
                  )}
                  {note.pinned && (
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--accent)" }}>
                      <Pin size={10} /> Pinned
                    </span>
                  )}
                </div>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Tag size={10} style={{ color: "var(--text-muted)" }} className="mt-0.5" />
                    {note.tags.map((t) => <TagBadge key={t} tag={t} small />)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={onPin} title={note.pinned ? "Unpin" : "Pin"}>
                  <Pin size={13} style={{ color: note.pinned ? "var(--accent)" : "var(--text-muted)" }} />
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
              {note.content ? (
                <div className="prose prose-invert prose-sm max-w-none
                  prose-headings:text-white/90 prose-headings:font-semibold
                  prose-p:text-white/65 prose-p:leading-relaxed
                  prose-strong:text-white/85 prose-strong:font-semibold
                  prose-em:text-white/70
                  prose-code:text-[var(--accent)] prose-code:bg-white/[0.08] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-white/[0.06] prose-pre:border prose-pre:border-white/[0.08] prose-pre:rounded-xl
                  prose-blockquote:border-l-[var(--accent)] prose-blockquote:text-white/50
                  prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline
                  prose-li:text-white/65
                  prose-hr:border-white/[0.08]
                  prose-th:text-white/80 prose-td:text-white/60
                  prose-table:border-white/[0.08]
                ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>This note is empty.</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
