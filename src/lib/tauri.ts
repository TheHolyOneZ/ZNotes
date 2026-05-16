import { invoke } from "@tauri-apps/api/core";
import type { Note, Checklist, ChecklistItem, AppSettings } from "../types";


export const getNotes = () => invoke<Note[]>("get_notes");
export const createNote = (input: { title: string; content: string; tags: string[]; color: string; reminder: string | null }) =>
  invoke<Note>("create_note", { input });
export const updateNote = (input: { id: string; title: string; content: string; tags: string[]; pinned: boolean; color: string; reminder: string | null }) =>
  invoke<void>("update_note", { input });
export const deleteNote = (id: string) => invoke<void>("delete_note", { id });
export const pinNote = (id: string, pinned: boolean) => invoke<void>("pin_note", { id, pinned });


export const getChecklists = () => invoke<Checklist[]>("get_checklists");
export const createChecklist = (input: {
  title: string; category: string; tags: string[];
  scheduled_date: string | null; reminder: string | null;
  items: { text: string; priority: string }[];
}) => invoke<Checklist>("create_checklist", { input });
export const updateChecklist = (input: {
  id: string; title: string; category: string; tags: string[];
  scheduled_date: string | null; pinned: boolean; reminder: string | null;
}) => invoke<void>("update_checklist", { input });
export const deleteChecklist = (id: string) => invoke<void>("delete_checklist", { id });
export const pinChecklist = (id: string, pinned: boolean) => invoke<void>("pin_checklist", { id, pinned });
export const pullChecklistToToday = (id: string) => invoke<void>("pull_checklist_to_today", { id });


export const addChecklistItem = (input: { checklist_id: string; text: string; priority: string }) =>
  invoke<ChecklistItem>("add_checklist_item", { input });
export const toggleChecklistItem = (id: string, completed: boolean) =>
  invoke<void>("toggle_checklist_item", { id, completed });
export const updateChecklistItem = (input: { id: string; text: string; priority: string }) =>
  invoke<void>("update_checklist_item", { input });
export const deleteChecklistItem = (id: string) => invoke<void>("delete_checklist_item", { id });
export const reorderChecklistItems = (ids: string[]) => invoke<void>("reorder_checklist_items", { ids });
export const replaceChecklistItems = (input: { checklist_id: string; items: { text: string; priority: string }[] }) =>
  invoke<ChecklistItem[]>("replace_checklist_items", { input });


export const getSettings = () => invoke<AppSettings>("get_settings");
export const updateSetting = (key: string, value: unknown) => invoke<void>("update_setting", { key, value });
export const resetAppData = () => invoke<void>("reset_app_data");


export const windowMinimize = () => invoke<void>("window_minimize");
export const windowMaximize = () => invoke<void>("window_maximize");
export const windowClose = () => invoke<void>("window_close");
export const setCloseToTray = (enabled: boolean) => invoke<void>("set_close_to_tray", { enabled });
