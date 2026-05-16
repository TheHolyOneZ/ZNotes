export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  color: string;
  reminder: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  position: number;
}

export interface Checklist {
  id: string;
  title: string;
  category: string;
  tags: string[];
  scheduled_date: string | null;
  pinned: boolean;
  reminder: string | null;
  created_at: string;
  updated_at: string;
  items: ChecklistItem[];
}

export interface AppSettings {
  theme: "dark" | "light";
  accent_color: string;
  border_radius: "none" | "small" | "medium" | "large";
  font_size: "small" | "medium" | "large";
  show_completed: boolean;
  enable_reminders: boolean;
  close_to_tray: boolean;
  default_view: "dashboard" | "notes" | "checklists" | "planner";
}

export type View = "dashboard" | "notes" | "checklists" | "planner" | "settings";

export type Priority = "low" | "medium" | "high";
