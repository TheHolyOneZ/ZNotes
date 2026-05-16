import { useMemo } from "react";
import { LayoutDashboard, FileText, CheckSquare, Calendar, Settings } from "lucide-react";
import type { View } from "../../types";
import { cn, isToday } from "../../lib/utils";
import { useNotesStore } from "../../store/notes";
import { useChecklistsStore } from "../../store/checklists";

interface SidebarProps {
  view: View;
  onView: (v: View) => void;
}

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "checklists", label: "Checklists", icon: CheckSquare },
  { id: "planner", label: "Day Planner", icon: Calendar },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar({ view, onView }: SidebarProps) {
  const notes = useNotesStore((s) => s.notes);
  const checklists = useChecklistsStore((s) => s.checklists);

  const counts = useMemo<Partial<Record<View, number>>>(() => ({
    notes: notes.length,
    checklists: checklists.length,
    planner: checklists.filter((c) => isToday(c.scheduled_date)).length,
  }), [notes.length, checklists]);

  return (
    <aside className="glass-sidebar w-56 flex flex-col flex-shrink-0 py-3 select-none">
      <nav className="flex-1 px-2 space-y-0.5 mt-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          const count = counts[id as View];
          return (
            <button
              key={id}
              onClick={() => onView(id as View)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left",
                active ? "text-white" : "hover:bg-white/[0.05]"
              )}
              style={active ? {
                background: "rgba(var(--accent-rgb), 0.15)",
                color: "var(--accent)",
                boxShadow: "inset 0 0 0 1px rgba(var(--accent-rgb), 0.25)",
              } : { color: "var(--text-secondary)" }}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              <span className="flex-1">{label}</span>
              {count !== undefined && count > 0 && (
                <span className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  active
                    ? "bg-[rgba(var(--accent-rgb),0.25)] text-[var(--accent)]"
                    : "bg-white/[0.08] text-white/40"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-white/[0.06]">
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>ZNotes v1.0.0</p>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>by TheHolyOneZ</p>
      </div>
    </aside>
  );
}
