import { create } from "zustand";
import type { AppSettings } from "../types";
import * as api from "../lib/tauri";

const DEFAULTS: AppSettings = {
  theme: "dark",
  accent_color: "#06b6d4",
  border_radius: "medium",
  font_size: "medium",
  show_completed: true,
  enable_reminders: true,
  close_to_tray: false,
  default_view: "dashboard",
};

interface SettingsState {
  settings: AppSettings;
  load: () => Promise<void>;
  set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  reset: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((setState) => ({
  settings: DEFAULTS,
  load: async () => {
    const s = await api.getSettings().catch(() => DEFAULTS);
    const settings = { ...DEFAULTS, ...s };
    setState({ settings });
    applySettings(settings);
  },
  set: async (key, value) => {
    await Promise.all([
      api.updateSetting(key, value),
      key === "close_to_tray" ? api.setCloseToTray(value as boolean) : Promise.resolve(),
    ]);
    setState((s) => {
      const settings = { ...s.settings, [key]: value };
      applySettings(settings);
      return { settings };
    });
  },
  reset: async () => {
    await api.resetAppData();
  },
}));

function applySettings(s: AppSettings) {
  const root = document.documentElement;
  root.style.setProperty("--accent", s.accent_color);
  const [r, g, b] = hexToRgb(s.accent_color);
  root.style.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);
  const radiusMap: Record<string, [string, string, string, string]> = {
    none:   ["0px",  "0px",  "0px",  "0px"],
    small:  ["3px",  "6px",  "8px",  "10px"],
    medium: ["6px",  "10px", "14px", "20px"],
    large:  ["8px",  "14px", "20px", "28px"],
  };
  const [rsm, rmd, rlg, rxl] = radiusMap[s.border_radius] ?? radiusMap.medium;
  root.style.setProperty("--radius-sm", rsm);
  root.style.setProperty("--radius-md", rmd);
  root.style.setProperty("--radius-lg", rlg);
  root.style.setProperty("--radius-xl", rxl);
  const sizes: Record<string, string> = { small: "13px", medium: "14px", large: "16px" };
  root.style.fontSize = sizes[s.font_size] ?? "14px";
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [6, 182, 212];
}
