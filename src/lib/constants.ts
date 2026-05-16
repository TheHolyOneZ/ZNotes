import type { Priority } from "../types";

export const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
export const MONTH_NAMES_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const MONTH_NAMES_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#f43f5e",
};

export const ACCENT_COLORS = [
  "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e", "#3b82f6", "#ec4899", "#14b8a6",
];

export const NOTE_COLORS = [
  { label: "None", value: "" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Emerald", value: "#10b981" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Blue", value: "#3b82f6" },
];
