import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { SlidersHorizontal, Tag, ChevronDown, Check, Layers } from "lucide-react";
import { Select } from "./Select";
import type { ReactNode } from "react";

interface FilterBarProps {
  sort: string;
  onSort: (v: string) => void;
  sortOptions: { value: string; label: string }[];
  allTags?: string[];
  tagFilters?: string[];
  onTagFilters?: (tags: string[]) => void;
  allCategories?: string[];
  categoryFilters?: string[];
  onCategoryFilters?: (cats: string[]) => void;
}

function toggleItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function MultiSelectPopover({
  open, onOpenChange, label, icon, items, selected, onToggle, onClear,
}: {
  open: boolean; onOpenChange: (o: boolean) => void;
  label: string; icon: ReactNode;
  items: string[]; selected: string[];
  onToggle: (s: string) => void; onClear: () => void;
}) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] text-xs transition-all"
          style={{
            color: selected.length ? "var(--accent)" : "var(--text-muted)",
            background: selected.length ? "rgba(var(--accent-rgb),0.1)" : "rgba(255,255,255,0.04)",
            border: selected.length ? "1px solid rgba(var(--accent-rgb),0.25)" : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {icon}
          <span>{label}</span>
          {selected.length > 0 && (
            <span className="w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold"
              style={{ background: "var(--accent)", color: "white" }}>
              {selected.length}
            </span>
          )}
          <ChevronDown size={10} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={6} align="start" style={{ outline: "none", zIndex: 300 }}
          className="glass-md rounded-[var(--radius-lg)] p-2 shadow-2xl min-w-[150px] max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {label}
            </span>
            {selected.length > 0 && (
              <button onClick={onClear} className="text-[10px] hover:text-rose-400 transition-colors" style={{ color: "var(--text-muted)" }}>Clear</button>
            )}
          </div>
          {items.map((item) => (
            <button key={item} onClick={() => onToggle(item)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-white/10 transition-colors text-left"
              style={{ color: "var(--text-secondary)" }}>
              <div className="w-3.5 h-3.5 rounded flex items-center justify-center border flex-shrink-0"
                style={selected.includes(item) ? { background: "var(--accent)", border: "none" } : { borderColor: "rgba(255,255,255,0.2)" }}>
                {selected.includes(item) && <Check size={9} color="white" />}
              </div>
              <span className="truncate">{item}</span>
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function FilterBar({
  sort, onSort, sortOptions,
  allTags = [], tagFilters = [], onTagFilters,
  allCategories = [], categoryFilters = [], onCategoryFilters,
}: FilterBarProps) {
  const [openPopover, setOpenPopover] = useState<"tags" | "categories" | null>(null);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SlidersHorizontal size={12} className="flex-shrink-0" style={{ color: "var(--text-muted)" }} />
      <Select options={sortOptions} value={sort} onChange={onSort} className="text-xs min-w-[140px]" />
      {allTags.length > 0 && onTagFilters && (
        <MultiSelectPopover
          open={openPopover === "tags"}
          onOpenChange={(o) => setOpenPopover(o ? "tags" : null)}
          label="Tags" icon={<Tag size={11} />}
          items={allTags} selected={tagFilters}
          onToggle={(t) => onTagFilters(toggleItem(tagFilters, t))}
          onClear={() => onTagFilters([])}
        />
      )}
      {allCategories.length > 0 && onCategoryFilters && (
        <MultiSelectPopover
          open={openPopover === "categories"}
          onOpenChange={(o) => setOpenPopover(o ? "categories" : null)}
          label="Category" icon={<Layers size={11} />}
          items={allCategories} selected={categoryFilters}
          onToggle={(c) => onCategoryFilters(toggleItem(categoryFilters, c))}
          onClear={() => onCategoryFilters([])}
        />
      )}
    </div>
  );
}
