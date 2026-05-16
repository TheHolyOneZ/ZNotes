import { create } from "zustand";
import type { Checklist, ChecklistItem } from "../types";
import * as api from "../lib/tauri";

export type ChecklistSort = "updated_desc" | "updated_asc" | "created_desc" | "created_asc" | "name_asc" | "name_desc" | "due_asc" | "due_desc";

interface ChecklistsState {
  checklists: Checklist[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  load: () => Promise<void>;
  upsert: (data: {
    title: string; category: string; tags: string[];
    scheduled_date: string | null; reminder: string | null;
    items: { text: string; priority: string }[];
    id?: string; pinned?: boolean;
  }) => Promise<void>;
  remove: (id: string) => Promise<void>;
  pin: (id: string, pinned: boolean) => Promise<void>;
  pullToToday: (id: string) => Promise<void>;
  clearReminder: (id: string) => void;
  setReminder: (id: string, reminder: string) => void;
  addItem: (input: Parameters<typeof api.addChecklistItem>[0]) => Promise<ChecklistItem>;
  toggleItem: (checklistId: string, itemId: string, completed: boolean) => Promise<void>;
  updateItem: (input: Parameters<typeof api.updateChecklistItem>[0]) => Promise<void>;
  removeItem: (checklistId: string, itemId: string) => Promise<void>;
}

const sortChecklists = (cls: Checklist[]) => [...cls].sort((a, b) => Number(b.pinned) - Number(a.pinned));

export const useChecklistsStore = create<ChecklistsState>((set) => ({
  checklists: [],
  loading: false,
  search: "",
  setSearch: (s) => set((state) => state.search === s ? state : { search: s }),
  load: async () => {
    set({ loading: true });
    const checklists = await api.getChecklists();
    set({ checklists, loading: false });
  },
  upsert: async (data) => {
    if (data.id) {
      await api.updateChecklist({ id: data.id, title: data.title, category: data.category, tags: data.tags, scheduled_date: data.scheduled_date, pinned: data.pinned ?? false, reminder: data.reminder });
      const newItems = await api.replaceChecklistItems({ checklist_id: data.id, items: data.items });
      set((s) => ({
        checklists: sortChecklists(s.checklists.map((c) => c.id === data.id
          ? { ...c, title: data.title, category: data.category, tags: data.tags, scheduled_date: data.scheduled_date, reminder: data.reminder, items: newItems, updated_at: new Date().toISOString() }
          : c
        )),
      }));
    } else {
      const cl = await api.createChecklist({ title: data.title, category: data.category, tags: data.tags, scheduled_date: data.scheduled_date, reminder: data.reminder, items: data.items });
      set((s) => ({ checklists: [cl, ...s.checklists] }));
    }
  },
  remove: async (id) => {
    await api.deleteChecklist(id);
    set((s) => ({ checklists: s.checklists.filter((c) => c.id !== id) }));
  },
  pin: async (id, pinned) => {
    await api.pinChecklist(id, pinned);
    set((s) => ({ checklists: sortChecklists(s.checklists.map((c) => c.id === id ? { ...c, pinned } : c)) }));
  },
  pullToToday: async (id) => {
    await api.pullChecklistToToday(id);
    const today = new Date().toISOString().slice(0, 10);
    set((s) => ({ checklists: s.checklists.map((c) => c.id === id ? { ...c, scheduled_date: today } : c) }));
  },
  clearReminder: (id) => {
    set((s) => ({ checklists: s.checklists.map((c) => c.id === id ? { ...c, reminder: null } : c) }));
  },
  setReminder: (id, reminder) => {
    set((s) => ({ checklists: s.checklists.map((c) => c.id === id ? { ...c, reminder } : c) }));
  },
  addItem: async (input) => {
    const item = await api.addChecklistItem(input);
    set((s) => ({
      checklists: s.checklists.map((c) =>
        c.id === input.checklist_id ? { ...c, items: [...c.items, item] } : c
      ),
    }));
    return item;
  },
  toggleItem: async (checklistId, itemId, completed) => {
    await api.toggleChecklistItem(itemId, completed);
    set((s) => ({
      checklists: s.checklists.map((c) =>
        c.id === checklistId
          ? { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, completed } : i) }
          : c
      ),
    }));
  },
  updateItem: async (input) => {
    await api.updateChecklistItem(input);
    set((s) => ({
      checklists: s.checklists.map((c) => ({
        ...c,
        items: c.items.map((i) => i.id === input.id ? { ...i, text: input.text, priority: input.priority as ChecklistItem["priority"] } : i),
      })),
    }));
  },
  removeItem: async (checklistId, itemId) => {
    await api.deleteChecklistItem(itemId);
    set((s) => ({
      checklists: s.checklists.map((c) =>
        c.id === checklistId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
      ),
    }));
  },
}));

function clSortFn(sort: ChecklistSort) {
  return (a: Checklist, b: Checklist) => {
    switch (sort) {
      case "updated_asc": return a.updated_at.localeCompare(b.updated_at);
      case "created_desc": return b.created_at.localeCompare(a.created_at);
      case "created_asc": return a.created_at.localeCompare(b.created_at);
      case "name_asc": return a.title.localeCompare(b.title);
      case "name_desc": return b.title.localeCompare(a.title);
      case "due_asc": return (a.scheduled_date ?? "9999").localeCompare(b.scheduled_date ?? "9999");
      case "due_desc": return (b.scheduled_date ?? "").localeCompare(a.scheduled_date ?? "");
      default: return b.updated_at.localeCompare(a.updated_at);
    }
  };
}

export function filteredChecklists(
  checklists: Checklist[], search: string,
  sort: ChecklistSort = "updated_desc",
  tagFilters: string[] = [], categoryFilters: string[] = []
) {
  let result = !search.trim() ? checklists : checklists.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );
  if (tagFilters.length > 0) result = result.filter((c) => tagFilters.every((t) => c.tags.includes(t)));
  if (categoryFilters.length > 0) result = result.filter((c) => categoryFilters.includes(c.category));
  const cmp = clSortFn(sort);
  const pinned = result.filter((c) => c.pinned).sort(cmp);
  const unpinned = result.filter((c) => !c.pinned).sort(cmp);
  return [...pinned, ...unpinned];
}
