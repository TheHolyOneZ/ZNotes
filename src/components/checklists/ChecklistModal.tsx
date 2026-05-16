import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { TagBadge } from "../ui/TagBadge";
import { Select } from "../ui/Select";
import { DatePicker } from "../ui/DatePicker";
import { DateTimePicker } from "../ui/DateTimePicker";
import { useTagInput } from "../../lib/hooks/useTagInput";
import { PRIORITY_COLORS } from "../../lib/constants";
import type { Checklist, Priority } from "../../types";

interface ChecklistModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Checklist | null;
  defaultDate?: string;
  onSave: (data: {
    title: string; category: string; tags: string[];
    scheduled_date: string | null; reminder: string | null;
    items: { text: string; priority: Priority }[];
    id?: string; pinned?: boolean;
  }) => void;
}

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: PRIORITY_COLORS.low },
  { value: "medium", label: "Medium", color: PRIORITY_COLORS.medium },
  { value: "high", label: "High", color: PRIORITY_COLORS.high },
];

export function ChecklistModal({ open, onClose, initial, defaultDate, onSave }: ChecklistModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);
  const [reminder, setReminder] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [newItemPriority, setNewItemPriority] = useState<Priority>("medium");
  const [items, setItems] = useState<{ text: string; priority: Priority }[]>([]);
  const { tags, tagInput, setTagInput, addTag, removeTag, handleTagKey, reset } = useTagInput();

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setCategory(initial?.category ?? "");
      setScheduledDate(initial?.scheduled_date ?? defaultDate ?? null);
      setReminder(initial?.reminder ?? null);
      setItems(initial?.items.map((i) => ({ text: i.text, priority: i.priority as Priority })) ?? []);
      setNewItemText("");
      reset(initial?.tags ?? []);
    }
  }, [open, initial]);

  const addItem = () => {
    if (!newItemText.trim()) return;
    setItems((p) => [...p, { text: newItemText.trim(), priority: newItemPriority }]);
    setNewItemText("");
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      ...(initial ? { id: initial.id, pinned: initial.pinned } : {}),
      title: title.trim(),
      category,
      tags,
      scheduled_date: scheduledDate,
      reminder,
      items,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Checklist" : "New Checklist"} size="lg">
      <div className="space-y-4">
        <div className="flex gap-3">
          <input
            autoFocus
            placeholder="Checklist title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="glass-input flex-1 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium"
          />
          <input
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="glass-input w-36 px-3 py-2.5 rounded-[var(--radius-md)] text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Tags</label>
          <div className="glass-xs rounded-[var(--radius-md)] px-3 py-2 flex flex-wrap gap-1.5 min-h-[40px] items-center">
            {tags.map((t) => (
              <TagBadge key={t} tag={t} small onRemove={() => removeTag(t)} />
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              onBlur={addTag}
              placeholder={tags.length ? "+" : "Tags (Enter or comma)"}
              className="flex-1 min-w-[80px] bg-transparent outline-none text-xs placeholder:text-white/25"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Scheduled Date</label>
            <DatePicker value={scheduledDate} onChange={setScheduledDate} placeholder="No date" />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Reminder</label>
            <DateTimePicker value={reminder} onChange={setReminder} placeholder="No reminder" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>Items</label>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 glass-xs rounded-[var(--radius-sm)] px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLORS[item.priority] }} />
                <span className="flex-1 text-sm" style={{ color: "var(--text-primary)" }}>{item.text}</span>
                <div className="w-24 flex-shrink-0">
                  <Select
                    options={PRIORITY_OPTIONS}
                    value={item.priority}
                    onChange={(v) => setItems((p) => p.map((x, j) => j === i ? { ...x, priority: v as Priority } : x))}
                    className="text-xs"
                  />
                </div>
                <button
                  onClick={() => setItems((p) => p.filter((_, j) => j !== i))}
                  className="hover:text-rose-400 transition-colors flex-shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
              placeholder="Add item..."
              className="glass-input flex-1 px-3 py-2 rounded-[var(--radius-md)] text-sm"
            />
            <div className="w-28 flex-shrink-0">
              <Select
                options={PRIORITY_OPTIONS}
                value={newItemPriority}
                onChange={(v) => setNewItemPriority(v as Priority)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={addItem} disabled={!newItemText.trim()}>
              <Plus size={14} />
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="accent" onClick={handleSave} disabled={!title.trim()}>
            {initial ? "Save Changes" : "Create Checklist"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
