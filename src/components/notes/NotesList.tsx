import { useState, useMemo } from "react";
import { Plus, FileText } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { SearchBar } from "../ui/SearchBar";
import { FilterBar } from "../ui/FilterBar";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { NoteCard } from "./NoteCard";
import { NoteModal } from "./NoteModal";
import { NoteViewModal } from "./NoteViewModal";
import { useNotesStore, filteredNotes } from "../../store/notes";
import type { NoteSort } from "../../store/notes";
import type { Note } from "../../types";

const SORT_OPTIONS = [
  { value: "updated_desc", label: "Updated (newest)" },
  { value: "updated_asc", label: "Updated (oldest)" },
  { value: "created_desc", label: "Created (newest)" },
  { value: "created_asc", label: "Created (oldest)" },
  { value: "name_asc", label: "Name A→Z" },
  { value: "name_desc", label: "Name Z→A" },
];

export function NotesList() {
  const { notes, search, setSearch, upsert, remove, pin } = useNotesStore();
  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [sort, setSort] = useState<NoteSort>("updated_desc");
  const [tagFilters, setTagFilters] = useState<string[]>([]);

  const allTags = useMemo(() => [...new Set(notes.flatMap((n) => n.tags))].sort(), [notes]);
  const displayed = useMemo(() => filteredNotes(notes, search, sort, tagFilters), [notes, search, sort, tagFilters]);

  const openEdit = (note: Note) => {
    setViewNote(null);
    setEditNote(note);
  };

  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Notes</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search notes..." className="w-48" />
          <Button variant="accent" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> New Note
          </Button>
        </div>
      </div>

      <div className="flex-shrink-0">
        <FilterBar
          sort={sort} onSort={(v) => setSort(v as NoteSort)}
          sortOptions={SORT_OPTIONS}
          allTags={allTags} tagFilters={tagFilters} onTagFilters={setTagFilters}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {displayed.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} style={{ color: "var(--text-muted)" }} />}
            message={search || tagFilters.length ? "No notes match your filters" : "No notes yet"}
            actionLabel={!search && !tagFilters.length ? "Create your first note" : undefined}
            onAction={!search && !tagFilters.length ? () => setCreateOpen(true) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
            <AnimatePresence mode="popLayout">
              {displayed.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onOpen={() => setViewNote(note)}
                  onEdit={() => openEdit(note)}
                  onDelete={() => remove(note.id)}
                  onPin={() => pin(note.id, !note.pinned)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <NoteViewModal
        open={!!viewNote}
        note={viewNote}
        onClose={() => setViewNote(null)}
        onEdit={() => viewNote && openEdit(viewNote)}
        onDelete={() => { viewNote && remove(viewNote.id); setViewNote(null); }}
        onPin={() => viewNote && pin(viewNote.id, !viewNote.pinned)}
      />

      <NoteModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initial={null}
        onSave={(data) => upsert(data)}
      />

      <NoteModal
        open={!!editNote}
        onClose={() => setEditNote(null)}
        initial={editNote}
        onSave={(data) => upsert(data)}
      />
    </div>
  );
}
