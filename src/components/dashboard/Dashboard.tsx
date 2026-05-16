import { useMemo, useState } from "react";
import { FileText, CheckSquare, Calendar, TrendingUp, Clock, Star, ArrowRight } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { ProgressBar } from "../ui/ProgressBar";
import { TagBadge } from "../ui/TagBadge";
import { NoteViewModal } from "../notes/NoteViewModal";
import { ChecklistViewModal } from "../checklists/ChecklistViewModal";
import { useNotesStore } from "../../store/notes";
import { useChecklistsStore } from "../../store/checklists";
import { useUiStore } from "../../store/ui";
import { isToday, isPast, checklistProgress, formatDateShort, today } from "../../lib/utils";
import type { View } from "../../types";

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const notes = useNotesStore((s) => s.notes);
  const { remove: removeNote, pin: pinNote } = useNotesStore();
  const { checklists, remove: removeChecklist, pin: pinChecklist } = useChecklistsStore();
  const setPlannerJump = useUiStore((s) => s.setPlannerJump);

  const [viewNoteId, setViewNoteId] = useState<string | null>(null);
  const [viewChecklistId, setViewChecklistId] = useState<string | null>(null);


  const viewNote = viewNoteId ? (notes.find((n) => n.id === viewNoteId) ?? null) : null;
  const viewChecklist = viewChecklistId ? (checklists.find((c) => c.id === viewChecklistId) ?? null) : null;

  const {
    todayChecklists, overdueChecklists, pinnedNotes, recentNotes,
    completedToday, totalToday, overallProgress, upcomingReminders,
  } = useMemo(() => {
    const now = new Date();
    const todayChecklists = checklists.filter((c) => isToday(c.scheduled_date));
    const overdueChecklists = checklists.filter((c) => isPast(c.scheduled_date));
    const pinnedNotes = notes.filter((n) => n.pinned);
    const recentNotes = notes.slice(0, 4);
    const allItems = checklists.flatMap((c) => c.items);
    const todayItems = todayChecklists.flatMap((c) => c.items);
    const completedToday = todayItems.filter((i) => i.completed).length;
    const totalToday = todayItems.length;
    const overallProgress = allItems.length
      ? Math.round((allItems.filter((i) => i.completed).length / allItems.length) * 100)
      : 0;
    const upcomingReminders = [
      ...notes.filter((n) => n.reminder && new Date(n.reminder) > now).map((n) => ({ id: n.id, title: n.title, date: n.reminder!, type: "note" as const })),
      ...checklists.filter((c) => c.reminder && new Date(c.reminder) > now).map((c) => ({ id: c.id, title: c.title, date: c.reminder!, type: "checklist" as const })),
    ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
    return { todayChecklists, overdueChecklists, pinnedNotes, recentNotes, completedToday, totalToday, overallProgress, upcomingReminders };
  }, [notes, checklists]);

  const todayStr = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    []
  );

  const goToOverdue = () => {
    if (overdueChecklists.length === 1 && overdueChecklists[0].scheduled_date) {
      setPlannerJump({ type: "day", date: overdueChecklists[0].scheduled_date });
    } else {
      setPlannerJump({ type: "overdue" });
    }
    onNavigate("planner");
  };

  const goToToday = () => {
    setPlannerJump({ type: "day", date: today() });
    onNavigate("planner");
  };

  const openReminder = (r: { id: string; type: "note" | "checklist" }) => {
    if (r.type === "note") setViewNoteId(r.id);
    else setViewChecklistId(r.id);
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{todayStr}</p>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <TrendingUp size={14} style={{ color: "var(--accent)" }} />
          <span>{overallProgress}% overall</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Notes", value: notes.length, icon: FileText, color: "#3b82f6", onClick: () => onNavigate("notes") },
          { label: "Checklists", value: checklists.length, icon: CheckSquare, color: "var(--accent)", onClick: () => onNavigate("checklists") },
          { label: "Today's Tasks", value: `${completedToday}/${totalToday}`, icon: Calendar, color: "#10b981", onClick: goToToday },
          { label: "Overdue", value: overdueChecklists.length, icon: Clock, color: overdueChecklists.length ? "#f43f5e" : "#10b981", onClick: goToOverdue },
        ].map(({ label, value, icon: Icon, color, onClick }) => (
          <GlassCard key={label} variant="sm" hover className="p-4 cursor-pointer" onClick={onClick}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon size={17} style={{ color }} />
              </div>
              <ArrowRight size={12} style={{ color: "var(--text-muted)" }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard variant="sm" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Today's Plan</h2>
            <button onClick={() => onNavigate("planner")} className="text-xs hover:underline" style={{ color: "var(--accent)" }}>View all</button>
          </div>
          {todayChecklists.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>Nothing scheduled for today</p>
          ) : (
            <div className="space-y-2">
              {todayChecklists.map((cl) => (
                <div key={cl.id}
                  className="rounded-[var(--radius-sm)] px-2 py-1.5 -mx-2 cursor-pointer hover:bg-white/[0.05] transition-colors"
                  onClick={() => setViewChecklistId(cl.id)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{cl.title}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {cl.items.filter((i) => i.completed).length}/{cl.items.length}
                    </span>
                  </div>
                  <ProgressBar value={checklistProgress(cl.items)} />
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard variant="sm" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Upcoming Reminders</h2>
          </div>
          {upcomingReminders.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>No upcoming reminders</p>
          ) : (
            <div className="space-y-1">
              {upcomingReminders.map((r, i) => (
                <div key={i}
                  className="flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-[var(--radius-sm)] cursor-pointer hover:bg-white/[0.05] transition-colors"
                  onClick={() => openReminder(r)}>
                  <div className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0"
                    style={{ background: r.type === "note" ? "rgba(59,130,246,0.15)" : "rgba(var(--accent-rgb),0.15)" }}>
                    {r.type === "note"
                      ? <FileText size={12} style={{ color: "#3b82f6" }} />
                      : <CheckSquare size={12} style={{ color: "var(--accent)" }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>{r.title}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{formatDateShort(r.date)}</p>
                  </div>
                  <Clock size={11} style={{ color: "var(--accent)" }} />
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {pinnedNotes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star size={13} style={{ color: "var(--accent)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Pinned Notes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pinnedNotes.slice(0, 3).map((note) => (
              <GlassCard key={note.id} variant="xs" hover className="p-3 cursor-pointer" onClick={() => setViewNoteId(note.id)}
                style={note.color ? { borderColor: `${note.color}25` } : {}}>
                <div className="font-medium text-xs mb-1 truncate" style={{ color: "var(--text-primary)" }}>{note.title}</div>
                {note.content && <p className="text-[11px] line-clamp-2" style={{ color: "var(--text-muted)" }}>{note.content}</p>}
                {note.tags.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {note.tags.slice(0, 2).map((t) => <TagBadge key={t} tag={t} small />)}
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {recentNotes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Notes</h2>
            <button onClick={() => onNavigate("notes")} className="text-xs hover:underline" style={{ color: "var(--accent)" }}>View all</button>
          </div>
          <div className="space-y-2">
            {recentNotes.map((note) => (
              <GlassCard key={note.id} variant="xs" hover className="p-3 cursor-pointer flex items-center gap-3" onClick={() => setViewNoteId(note.id)}>
                <div className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0"
                  style={{ background: note.color ? `${note.color}20` : "rgba(255,255,255,0.06)" }}>
                  <FileText size={12} style={{ color: note.color || "var(--text-muted)" }} />
                </div>
                <p className="text-xs font-medium truncate flex-1" style={{ color: "var(--text-secondary)" }}>{note.title}</p>
                <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-muted)" }}>{formatDateShort(note.updated_at)}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      <NoteViewModal
        open={!!viewNote}
        note={viewNote}
        onClose={() => setViewNoteId(null)}
        onEdit={() => { onNavigate("notes"); setViewNoteId(null); }}
        onDelete={() => { viewNote && removeNote(viewNote.id); setViewNoteId(null); }}
        onPin={() => viewNote && pinNote(viewNote.id, !viewNote.pinned)}
      />

      <ChecklistViewModal
        open={!!viewChecklist}
        checklist={viewChecklist}
        onClose={() => setViewChecklistId(null)}
        onEdit={() => { onNavigate("checklists"); setViewChecklistId(null); }}
        onDelete={() => { viewChecklist && removeChecklist(viewChecklist.id); setViewChecklistId(null); }}
        onPin={() => viewChecklist && pinChecklist(viewChecklist.id, !viewChecklist.pinned)}
      />
    </div>
  );
}
