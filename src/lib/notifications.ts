import {
  isPermissionGranted,
  requestPermission,
} from "@tauri-apps/plugin-notification";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";
import { useNotesStore } from "../store/notes";
import { useChecklistsStore } from "../store/checklists";


export interface ReminderToast {
  id: string;
  kind: "note" | "checklist";
  itemId: string;
  title: string;
  body: string;
  firedAt: number;
}

interface ToastState {
  toasts: ReminderToast[];
  add: (t: ReminderToast) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (t) => set((s) => ({ toasts: [t, ...s.toasts].slice(0, 5) })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  dismissAll: () => set({ toasts: [] }),
}));


export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    let granted = await isPermissionGranted();
    if (!granted) {
      const result = await requestPermission();
      granted = result === "granted";
    }
    return granted;
  } catch {
    return false;
  }
}


interface ReminderPayload {
  kind: "note" | "checklist";
  id: string;
  title: string;
  body: string;
}

let listenerCleanup: (() => void) | null = null;

export async function initNotifications(): Promise<void> {


  await ensureNotificationPermission();

  if (listenerCleanup) listenerCleanup();

  const unlisten = await listen<ReminderPayload>("znotes:reminder-fired", (event) => {
    const { kind, id, title, body } = event.payload;


    useToastStore.getState().add({
      id: crypto.randomUUID(),
      kind,
      itemId: id,
      title,
      body,
      firedAt: Date.now(),
    });


    if (kind === "note") {
      useNotesStore.getState().clearReminder(id);
    } else {
      useChecklistsStore.getState().clearReminder(id);
    }
  });

  listenerCleanup = unlisten;
}


export async function snoozeReminder(kind: string, id: string, minutes: number): Promise<void> {
  await invoke("snooze_reminder", { kind, id, minutes });
  const newTime = new Date(Date.now() + minutes * 60_000).toISOString();
  if (kind === "note") {
    useNotesStore.getState().setReminder(id, newTime);
  } else {
    useChecklistsStore.getState().setReminder(id, newTime);
  }
}

export async function clearReminder(kind: string, id: string): Promise<void> {
  await invoke("clear_reminder", { kind, id });
  if (kind === "note") {
    useNotesStore.getState().clearReminder(id);
  } else {
    useChecklistsStore.getState().clearReminder(id);
  }
}
