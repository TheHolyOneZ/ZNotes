import { create } from "zustand";
import type { Note } from "../types";
import * as api from "../lib/tauri";

export type NoteSort = "updated_desc" | "updated_asc" | "created_desc" | "created_asc" | "name_asc" | "name_desc";

interface NotesState {
  notes: Note[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  load: () => Promise<void>;
  upsert: (data: { title: string; content: string; tags: string[]; color: string; reminder: string | null; id?: string; pinned?: boolean }) => Promise<void>;
  remove: (id: string) => Promise<void>;
  pin: (id: string, pinned: boolean) => Promise<void>;
  clearReminder: (id: string) => void;
  setReminder: (id: string, reminder: string) => void;
}

const sortNotes = (notes: Note[]) => [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  loading: false,
  search: "",
  setSearch: (s) => set((state) => state.search === s ? state : { search: s }),
  load: async () => {
    set({ loading: true });
    const notes = await api.getNotes();
    set({ notes, loading: false });
  },
  upsert: async (data) => {
    if (data.id) {
      await api.updateNote({ id: data.id, title: data.title, content: data.content, tags: data.tags, pinned: data.pinned ?? false, color: data.color, reminder: data.reminder });
      set((s) => ({ notes: sortNotes(s.notes.map((n) => n.id === data.id ? { ...n, ...data, updated_at: new Date().toISOString() } : n)) }));
    } else {
      const note = await api.createNote({ title: data.title, content: data.content, tags: data.tags, color: data.color, reminder: data.reminder });
      set((s) => ({ notes: [note, ...s.notes] }));
    }
  },
  remove: async (id) => {
    await api.deleteNote(id);
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
  },
  pin: async (id, pinned) => {
    await api.pinNote(id, pinned);
    set((s) => ({ notes: sortNotes(s.notes.map((n) => n.id === id ? { ...n, pinned } : n)) }));
  },
  clearReminder: (id) => {
    set((s) => ({ notes: s.notes.map((n) => n.id === id ? { ...n, reminder: null } : n) }));
  },
  setReminder: (id, reminder) => {
    set((s) => ({ notes: s.notes.map((n) => n.id === id ? { ...n, reminder } : n) }));
  },
}));

function noteSortFn(sort: NoteSort) {
  return (a: Note, b: Note) => {
    switch (sort) {
      case "updated_asc": return a.updated_at.localeCompare(b.updated_at);
      case "created_desc": return b.created_at.localeCompare(a.created_at);
      case "created_asc": return a.created_at.localeCompare(b.created_at);
      case "name_asc": return a.title.localeCompare(b.title);
      case "name_desc": return b.title.localeCompare(a.title);
      default: return b.updated_at.localeCompare(a.updated_at);
    }
  };
}

export function filteredNotes(
  notes: Note[], search: string,
  sort: NoteSort = "updated_desc", tagFilters: string[] = []
) {
  let result = !search.trim() ? notes : notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );
  if (tagFilters.length > 0) result = result.filter((n) => tagFilters.every((t) => n.tags.includes(t)));
  const cmp = noteSortFn(sort);
  const pinned = result.filter((n) => n.pinned).sort(cmp);
  const unpinned = result.filter((n) => !n.pinned).sort(cmp);
  return [...pinned, ...unpinned];
}
