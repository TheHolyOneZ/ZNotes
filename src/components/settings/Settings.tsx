import { useState } from "react";
import { Monitor, Bell, Eye, Palette, AlertTriangle, ExternalLink, Globe, GitFork, Code2, Scale } from "lucide-react";
import appIcon from "../../assets/base.png";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { useSettingsStore } from "../../store/settings";
import { ACCENT_COLORS } from "../../lib/constants";
import { openUrl } from "../../lib/links";
import type { AppSettings } from "../../types";

const RADIUS_OPTIONS: { label: string; value: AppSettings["border_radius"] }[] = [
  { label: "None", value: "none" }, { label: "Small", value: "small" },
  { label: "Medium", value: "medium" }, { label: "Large", value: "large" },
];

const FONT_OPTIONS: { label: string; value: AppSettings["font_size"] }[] = [
  { label: "Small", value: "small" }, { label: "Medium", value: "medium" }, { label: "Large", value: "large" },
];

const VIEW_OPTIONS: { label: string; value: AppSettings["default_view"] }[] = [
  { label: "Dashboard", value: "dashboard" }, { label: "Notes", value: "notes" },
  { label: "Checklists", value: "checklists" }, { label: "Day Planner", value: "planner" },
];

export function Settings() {
  const { settings, set, reset } = useSettingsStore();
  const [showReset, setShowReset] = useState(false);

  const s = <K extends keyof AppSettings>(key: K) => (value: AppSettings[K]) => set(key, value);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Customize your ZNotes experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <GlassCard variant="sm" className="p-5 space-y-5">
          <SectionHeader icon={<Palette size={14} />} title="Appearance" />

          <div>
            <Label>Accent Color</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ACCENT_COLORS.map((c) => (
                <button key={c} onClick={() => s("accent_color")(c)}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{
                    background: c,
                    borderColor: settings.accent_color === c ? "white" : "transparent",
                    boxShadow: settings.accent_color === c ? `0 0 12px ${c}60` : "none",
                  }} />
              ))}
              <input
                type="color"
                value={settings.accent_color}
                onChange={(e) => s("accent_color")(e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer border-2 border-white/20 bg-transparent"
                title="Custom color"
              />
            </div>
          </div>

          <div>
            <Label>Border Radius</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {RADIUS_OPTIONS.map(({ label, value }) => (
                <OptionButton key={value} active={settings.border_radius === value} onClick={() => s("border_radius")(value)}>
                  {label}
                </OptionButton>
              ))}
            </div>
          </div>

          <div>
            <Label>Font Size</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {FONT_OPTIONS.map(({ label, value }) => (
                <OptionButton key={value} active={settings.font_size === value} onClick={() => s("font_size")(value)}>
                  {label}
                </OptionButton>
              ))}
            </div>
          </div>
        </GlassCard>


        <GlassCard variant="sm" className="p-5 space-y-5">
          <SectionHeader icon={<Monitor size={14} />} title="Preferences" />

          <div>
            <Label>Default View</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {VIEW_OPTIONS.map(({ label, value }) => (
                <OptionButton key={value} active={settings.default_view === value} onClick={() => s("default_view")(value)}>
                  {label}
                </OptionButton>
              ))}
            </div>
          </div>

          <Toggle
            label="Show Completed Items"
            description="Display completed checklist items"
            checked={settings.show_completed}
            onChange={(v) => s("show_completed")(v)}
            icon={<Eye size={13} />}
          />

          <Toggle
            label="Enable Reminders"
            description="Show reminder notifications"
            checked={settings.enable_reminders}
            onChange={(v) => s("enable_reminders")(v)}
            icon={<Bell size={13} />}
          />

          <Toggle
            label="Close to Tray"
            description="Keep running in the background when closed"
            checked={settings.close_to_tray}
            onChange={(v) => s("close_to_tray")(v)}
            icon={<Monitor size={13} />}
          />
        </GlassCard>


        <GlassCard variant="sm" className="p-5 space-y-4">
          <SectionHeader icon={<Globe size={14} />} title="About" />

          <div className="flex items-center gap-3">
            <img src={appIcon} alt="ZNotes" className="w-12 h-12 rounded-[var(--radius-lg)] flex-shrink-0 object-cover"
              style={{ boxShadow: "0 0 16px rgba(var(--accent-rgb),0.35)" }} />
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>ZNotes</p>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: "rgba(var(--accent-rgb),0.15)", color: "var(--accent)" }}>v1.0.0</span>
              </div>
              <p className="text-xs leading-relaxed mt-0.5" style={{ color: "var(--text-muted)" }}>
                Modern, cross-platform notes &amp; checklists. Built with React, Tauri v2, and Rust — fast, offline-first, fully native.
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {["React 18", "TypeScript", "Tauri v2", "Rust", "Zustand", "Framer Motion", "Tailwind CSS", "SQLite"].map((tech) => (
                <span key={tech} className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                  style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Links</p>
            {[
              { icon: <Globe size={12} />, label: "zsync.eu", sub: "More cool projects", url: "https://zsync.eu" },
              { icon: <GitFork size={12} />, label: "github.com/theholyonez", sub: "Author's GitHub", url: "https://github.com/theholyonez" },
              { icon: <Code2 size={12} />, label: "ZNotes Source Code", sub: "github.com/TheHolyOneZ/ZNotes", url: "https://github.com/TheHolyOneZ/ZNotes" },
              { icon: <ExternalLink size={12} />, label: "zsync.eu/znotes", sub: "Downloads & landing page", url: "https://zsync.eu/znotes/" },
            ].map(({ icon, label, sub, url }) => (
              <button key={url} onClick={() => openUrl(url)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all hover:bg-white/[0.06] group"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ color: "var(--accent)" }}>{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>{label}</p>
                  <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{sub}</p>
                </div>
                <ExternalLink size={10} className="opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" style={{ color: "var(--text-muted)" }} />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Scale size={11} style={{ color: "var(--text-muted)" }} />
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Licensed under{" "}
              <button onClick={() => openUrl("https://www.gnu.org/licenses/gpl-3.0.html")}
                className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                style={{ color: "var(--accent)" }}>
                GPL v3.0
              </button>
              {" "}· © TheHolyOneZ
            </p>
          </div>
        </GlassCard>

        {/* Danger zone */}
        <GlassCard variant="sm" className="p-5 space-y-4" style={{ borderColor: "rgba(244,63,94,0.15)" }}>
          <SectionHeader icon={<AlertTriangle size={14} style={{ color: "#f43f5e" }} />} title="Danger Zone" />
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Permanently delete all your notes and checklists. This cannot be undone.
          </p>
          {!showReset ? (
            <Button variant="danger" size="sm" onClick={() => setShowReset(true)}>
              Reset App Data
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-rose-400">Are you absolutely sure?</p>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={async () => { await reset(); setShowReset(false); window.location.reload(); }}>
                  Yes, Delete Everything
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowReset(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: "var(--accent)" }}>{icon}</span>
      <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{children}</p>;
}

function OptionButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="py-1.5 px-2 rounded-lg text-xs font-medium transition-all"
      style={active ? {
        background: "rgba(var(--accent-rgb), 0.18)",
        color: "var(--accent)",
        border: "1px solid rgba(var(--accent-rgb), 0.35)",
      } : {
        background: "rgba(255,255,255,0.04)",
        color: "var(--text-muted)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {children}
    </button>
  );
}

function Toggle({ label, description, checked, onChange, icon }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void; icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-2">
        {icon && <span className="mt-0.5" style={{ color: "var(--text-muted)" }}>{icon}</span>}
        <div>
          <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{label}</p>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-10 h-5.5 rounded-full flex-shrink-0 transition-all"
        style={{
          background: checked ? "var(--accent)" : "rgba(255,255,255,0.12)",
          boxShadow: checked ? "0 0 10px rgba(var(--accent-rgb),0.35)" : "none",
          minWidth: 40, height: 22,
        }}
      >
        <span className="absolute top-0.5 transition-all rounded-full bg-white shadow"
          style={{ width: 18, height: 18, left: checked ? "calc(100% - 20px)" : "2px" }} />
      </button>
    </div>
  );
}
