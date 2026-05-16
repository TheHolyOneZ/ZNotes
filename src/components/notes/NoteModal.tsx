import { useState, useEffect } from "react";
import { Eye, Edit3 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { TagBadge } from "../ui/TagBadge";
import { DateTimePicker } from "../ui/DateTimePicker";
import { useTagInput } from "../../lib/hooks/useTagInput";
import { NOTE_COLORS } from "../../lib/constants";
import type { Note } from "../../types";

interface NoteModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Note | null;
  onSave: (data: {
    title: string; content: string; tags: string[]; color: string; reminder: string | null;
    pinned?: boolean; id?: string;
  }) => void;
}

export function NoteModal({ open, onClose, initial, onSave }: NoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("");
  const [reminder, setReminder] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const { tags, tagInput, setTagInput, addTag, removeTag, handleTagKey, reset } = useTagInput();

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setContent(initial?.content ?? "");
      setColor(initial?.color ?? "");
      setReminder(initial?.reminder ?? null);
      setPreview(false);
      reset(initial?.tags ?? []);
    }
  }, [open, initial]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      ...(initial ? { id: initial.id, pinned: initial.pinned } : {}),
      title: title.trim(),
      content,
      tags,
      color,
      reminder,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Note" : "New Note"} size="lg">
      <div className="space-y-4">
        <input
          autoFocus
          placeholder="Note title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="glass-input w-full px-4 py-3 rounded-[var(--radius-md)] text-base font-medium"
        />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setPreview(false)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${!preview ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
            >
              <Edit3 size={11} /> Edit
            </button>
            <button
              onClick={() => setPreview(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${preview ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
            >
              <Eye size={11} /> Preview
            </button>
          </div>
          {preview ? (
            <div className="glass-xs rounded-[var(--radius-md)] px-4 py-3 min-h-[200px] prose prose-invert prose-sm max-w-none text-sm"
              style={{ color: "var(--text-secondary)" }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "_Nothing to preview_"}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              placeholder="Write your note... (Markdown supported)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="glass-input w-full px-4 py-3 rounded-[var(--radius-md)] text-sm resize-none font-mono"
            />
          )}
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Tags</label>
          <div className="glass-xs rounded-[var(--radius-md)] px-3 py-2 flex flex-wrap gap-1.5 min-h-[42px] items-center">
            {tags.map((t) => (
              <TagBadge key={t} tag={t} small onRemove={() => removeTag(t)} />
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              onBlur={addTag}
              placeholder={tags.length ? "Add tag..." : "Add tags (Enter or comma)"}
              className="flex-1 min-w-[100px] bg-transparent outline-none text-xs placeholder:text-white/25"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Color Accent</label>
            <div className="flex gap-2 flex-wrap">
              {NOTE_COLORS.map(({ value, label }) => (
                <button
                  key={value}
                  title={label}
                  onClick={() => setColor(value)}
                  className="w-6 h-6 rounded-full border-2 transition-all"
                  style={{
                    background: value || "rgba(255,255,255,0.08)",
                    borderColor: color === value ? "white" : "transparent",
                    boxShadow: color === value ? "0 0 8px rgba(255,255,255,0.4)" : "none",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Reminder</label>
            <DateTimePicker value={reminder} onChange={setReminder} placeholder="No reminder" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="accent" onClick={handleSave} disabled={!title.trim()}>
            {initial ? "Save Changes" : "Create Note"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
