import { useState, useMemo } from "react";
import { Plus, CheckSquare } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { SearchBar } from "../ui/SearchBar";
import { FilterBar } from "../ui/FilterBar";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { ChecklistCard } from "./ChecklistCard";
import { ChecklistModal } from "./ChecklistModal";
import { ChecklistViewModal } from "./ChecklistViewModal";
import { useChecklistsStore, filteredChecklists } from "../../store/checklists";
import type { ChecklistSort } from "../../store/checklists";
const SORT_OPTIONS = [
  { value: "updated_desc", label: "Updated (newest)" },
  { value: "updated_asc", label: "Updated (oldest)" },
  { value: "created_desc", label: "Created (newest)" },
  { value: "created_asc", label: "Created (oldest)" },
  { value: "name_asc", label: "Name A→Z" },
  { value: "name_desc", label: "Name Z→A" },
  { value: "due_asc", label: "Due (soonest)" },
  { value: "due_desc", label: "Due (latest)" },
];

export function ChecklistsList() {
  const { checklists, search, setSearch, upsert, remove, pin } = useChecklistsStore();
  const [viewChecklistId, setViewChecklistId] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const viewChecklist = viewChecklistId ? (checklists.find((c) => c.id === viewChecklistId) ?? null) : null;
  const editingChecklist = editing ? (checklists.find((c) => c.id === editing) ?? null) : null;
  const [modalOpen, setModalOpen] = useState(false);
  const [sort, setSort] = useState<ChecklistSort>("updated_desc");
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);

  const allTags = useMemo(() => [...new Set(checklists.flatMap((c) => c.tags))].sort(), [checklists]);
  const allCategories = useMemo(() => [...new Set(checklists.map((c) => c.category).filter(Boolean))].sort(), [checklists]);
  const displayed = useMemo(() => filteredChecklists(checklists, search, sort, tagFilters, categoryFilters), [checklists, search, sort, tagFilters, categoryFilters]);

  const openEdit = (id: string) => {
    setViewChecklistId(null);
    setEditing(id);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Checklists</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{checklists.length} checklist{checklists.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search checklists..." className="w-48" />
          <Button variant="accent" size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus size={14} /> New Checklist
          </Button>
        </div>
      </div>

      <div className="flex-shrink-0">
        <FilterBar
          sort={sort} onSort={(v) => setSort(v as ChecklistSort)}
          sortOptions={SORT_OPTIONS}
          allTags={allTags} tagFilters={tagFilters} onTagFilters={setTagFilters}
          allCategories={allCategories} categoryFilters={categoryFilters} onCategoryFilters={setCategoryFilters}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {displayed.length === 0 ? (
          <EmptyState
            icon={<CheckSquare size={28} style={{ color: "var(--text-muted)" }} />}
            message={search || tagFilters.length || categoryFilters.length ? "No checklists match your filters" : "No checklists yet"}
            actionLabel={!search && !tagFilters.length && !categoryFilters.length ? "Create your first checklist" : undefined}
            onAction={!search && !tagFilters.length && !categoryFilters.length ? () => setModalOpen(true) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
            <AnimatePresence mode="popLayout">
              {displayed.map((cl) => (
                <ChecklistCard
                  key={cl.id}
                  checklist={cl}
                  onOpen={() => setViewChecklistId(cl.id)}
                  onEdit={() => openEdit(cl.id)}
                  onDelete={() => remove(cl.id)}
                  onPin={() => pin(cl.id, !cl.pinned)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ChecklistViewModal
        open={!!viewChecklist}
        checklist={viewChecklist}
        onClose={() => setViewChecklistId(null)}
        onEdit={() => viewChecklist && openEdit(viewChecklist.id)}
        onDelete={() => { viewChecklist && remove(viewChecklist.id); setViewChecklistId(null); }}
        onPin={() => viewChecklist && pin(viewChecklist.id, !viewChecklist.pinned)}
      />

      <ChecklistModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        initial={editingChecklist}
        onSave={(data) => upsert(data)}
      />
    </div>
  );
}
