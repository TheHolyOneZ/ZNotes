import { useState, useMemo, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, ArrowDownToLine, Calendar, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { ProgressBar } from "../ui/ProgressBar";
import { Button } from "../ui/Button";
import { FilterBar } from "../ui/FilterBar";
import { EmptyState } from "../ui/EmptyState";
import { ChecklistModal } from "../checklists/ChecklistModal";
import { MonthCalendar } from "./MonthCalendar";
import { YearCalendar } from "./YearCalendar";
import { useChecklistsStore, filteredChecklists } from "../../store/checklists";
import { useUiStore } from "../../store/ui";
import type { ChecklistSort } from "../../store/checklists";
import { today, addDays, checklistProgress, isToday, isPast } from "../../lib/utils";
import { MONTH_NAMES_FULL, DAYS_OF_WEEK } from "../../lib/constants";
import type { Checklist } from "../../types";

type CalView = "week" | "month" | "year";

function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return { day: DAYS_OF_WEEK[d.getDay()], num: d.getDate() };
}

const SORT_OPTIONS = [
  { value: "updated_desc", label: "Updated (newest)" },
  { value: "name_asc", label: "Name A→Z" },
  { value: "due_asc", label: "Due (soonest)" },
];

export function DayPlanner() {
  const { checklists, upsert, remove, pullToToday, toggleItem } = useChecklistsStore();
  const { plannerJump, clearPlannerJump } = useUiStore();
  const [calView, setCalView] = useState<CalView>("week");
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string>("");
  const [editing, setEditing] = useState<Checklist | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(today());
  const [sort, setSort] = useState<ChecklistSort>("updated_desc");
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [overdueOnly, setOverdueOnly] = useState(false);


  useEffect(() => {
    if (!plannerJump) return;
    if (plannerJump.type === "day") {
      const date = plannerJump.date;
      setSelectedDay(date);
      setWeekStart(getWeekStart(new Date(date + "T12:00:00")));
      setCalYear(new Date(date + "T12:00:00").getFullYear());
      setCalMonth(new Date(date + "T12:00:00").getMonth());
      setCalView("week");
      setOverdueOnly(false);
    } else if (plannerJump.type === "overdue") {
      setOverdueOnly(true);
    }
    clearPlannerJump();
  }, [plannerJump, clearPlannerJump]);

  const allTags = useMemo(() => [...new Set(checklists.flatMap((c) => c.tags))].sort(), [checklists]);
  const allCategories = useMemo(() => [...new Set(checklists.map((c) => c.category).filter(Boolean))].sort(), [checklists]);

  const filteredAll = useMemo(() =>
    filteredChecklists(checklists, "", sort, tagFilters, categoryFilters),
    [checklists, sort, tagFilters, categoryFilters]
  );

  const overdueItems = useMemo(() =>
    filteredAll.filter((c) => isPast(c.scheduled_date))
      .sort((a, b) => (a.scheduled_date ?? "").localeCompare(b.scheduled_date ?? "")),
    [filteredAll]
  );

  const checklistsByDate = useMemo(() => {
    const map = new Map<string, Checklist[]>();
    filteredAll.forEach((c) => {
      if (c.scheduled_date) {
        const arr = map.get(c.scheduled_date) ?? [];
        arr.push(c);
        map.set(c.scheduled_date, arr);
      }
    });
    return map;
  }, [filteredAll]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const dayItems = useMemo(() => checklistsByDate.get(selectedDay) ?? [], [checklistsByDate, selectedDay]);

  const prevPeriod = useCallback(() => {
    if (calView === "week") setWeekStart((d) => addDays(d, -7));
    else if (calView === "month") setCalMonth((m) => { if (m === 0) { setCalYear((y) => y - 1); return 11; } return m - 1; });
    else setCalYear((y) => y - 1);
  }, [calView]);

  const nextPeriod = useCallback(() => {
    if (calView === "week") setWeekStart((d) => addDays(d, 7));
    else if (calView === "month") setCalMonth((m) => { if (m === 11) { setCalYear((y) => y + 1); return 0; } return m + 1; });
    else setCalYear((y) => y + 1);
  }, [calView]);

  const goToday = useCallback(() => {
    const t = today();
    setWeekStart(getWeekStart(new Date()));
    setSelectedDay(t);
    setCalYear(new Date().getFullYear());
    setCalMonth(new Date().getMonth());
    setCalView("week");
    setOverdueOnly(false);
  }, []);

  const openNew = useCallback((date: string) => {
    setEditing(null); setModalDate(date); setModalOpen(true);
  }, []);

  const handleSave = async (data: Parameters<typeof upsert>[0]) => {
    await upsert({ ...data, scheduled_date: data.scheduled_date || modalDate });
  };

  const periodLabel = useMemo(() => {
    if (overdueOnly) return "Overdue Tasks";
    if (calView === "week") {
      const end = addDays(weekStart, 6);
      const s = new Date(weekStart + "T12:00:00");
      const e = new Date(end + "T12:00:00");
      return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    if (calView === "month") return `${MONTH_NAMES_FULL[calMonth]} ${calYear}`;
    return String(calYear);
  }, [overdueOnly, calView, weekStart, calMonth, calYear]);

  const { num: selNum, day: selDay } = useMemo(() => formatDisplayDate(selectedDay), [selectedDay]);


  const overdueByDate = useMemo(() => {
    const map = new Map<string, Checklist[]>();
    overdueItems.forEach((c) => {
      if (!c.scheduled_date) return;
      const arr = map.get(c.scheduled_date) ?? [];
      arr.push(c);
      map.set(c.scheduled_date, arr);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [overdueItems]);

  const renderChecklist = (cl: Checklist) => (
    <motion.div key={cl.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
      <GlassCard variant="sm" className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{cl.title}</h3>
            {cl.category && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{cl.category}</p>}
          </div>
          <div className="flex items-center gap-1">
            {!isToday(cl.scheduled_date) && (
              <button onClick={() => pullToToday(cl.id)} title="Pull to today"
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: "var(--accent)" }}>
                <ArrowDownToLine size={12} />
              </button>
            )}
            <button
              onClick={() => { setEditing(cl); setModalDate(cl.scheduled_date ?? selectedDay); setModalOpen(true); }}
              className="text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: "var(--text-muted)" }}>Edit</button>
            <button onClick={() => remove(cl.id)}
              className="text-xs px-2 py-1 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
              style={{ color: "var(--text-muted)" }}>Delete</button>
          </div>
        </div>
        <ProgressBar value={checklistProgress(cl.items)} showLabel className="mb-3" />
        <div className="space-y-1.5">
          {cl.items.map((item) => (
            <button key={item.id} onClick={() => toggleItem(cl.id, item.id, !item.completed)}
              className="w-full flex items-center gap-2.5 py-1 text-left group">
              <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.completed ? "border-emerald-500 bg-emerald-500/20" : "border-white/20 group-hover:border-white/40"}`}>
                {item.completed && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-sm flex-1 transition-all ${item.completed ? "line-through" : ""}`}
                style={{ color: item.completed ? "var(--text-muted)" : "var(--text-secondary)" }}>
                {item.text}
              </span>
            </button>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Day Planner</h1>
          <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: overdueOnly ? "#f43f5e" : "var(--text-muted)" }}>
            {overdueOnly && <AlertCircle size={10} />}
            {periodLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {overdueOnly ? (
            <Button variant="outline" size="sm" onClick={() => setOverdueOnly(false)}>
              <X size={13} /> Clear Filter
            </Button>
          ) : (
            <div className="flex items-center rounded-[var(--radius-md)] overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              {(["week", "month", "year"] as CalView[]).map((v) => (
                <button key={v} onClick={() => setCalView(v)}
                  className="px-3 py-1.5 text-xs font-medium transition-all capitalize"
                  style={calView === v ? {
                    background: "rgba(var(--accent-rgb),0.2)", color: "var(--accent)",
                  } : { color: "var(--text-muted)" }}>
                  {v}
                </button>
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
          {!overdueOnly && (
            <>
              <Button variant="outline" size="sm" onClick={prevPeriod}><ChevronLeft size={14} /></Button>
              <Button variant="outline" size="sm" onClick={nextPeriod}><ChevronRight size={14} /></Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-shrink-0">
        <FilterBar
          sort={sort} onSort={(v) => setSort(v as ChecklistSort)}
          sortOptions={SORT_OPTIONS}
          allTags={allTags} tagFilters={tagFilters} onTagFilters={setTagFilters}
          allCategories={allCategories} categoryFilters={categoryFilters} onCategoryFilters={setCategoryFilters}
        />
      </div>

      {overdueOnly ? (
        <div className="flex-1 overflow-y-auto">
          {overdueItems.length === 0 ? (
            <EmptyState
              icon={<AlertCircle size={24} style={{ color: "var(--text-muted)" }} />}
              message="No overdue tasks — you're all caught up!"
            />
          ) : (
            <div className="space-y-5">
              {overdueByDate.map(([date, items]) => {
                const d = new Date(date + "T12:00:00");
                const label = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
                return (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(244,63,94,0.15)", color: "#f43f5e" }}>{label}</span>
                    </div>
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {items.map(renderChecklist)}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : calView === "year" ? (
        <div className="flex-1 overflow-y-auto">
          <YearCalendar year={calYear} checklistsByDate={checklistsByDate}
            onMonthClick={(m) => { setCalMonth(m); setCalView("month"); }} />
        </div>
      ) : calView === "month" ? (
        <div className="flex-1 overflow-y-auto">
          <MonthCalendar year={calYear} month={calMonth}
            checklistsByDate={checklistsByDate} selectedDay={selectedDay}
            onDayClick={(date) => {
              setSelectedDay(date);
              setWeekStart(getWeekStart(new Date(date + "T12:00:00")));
              setCalView("week");
            }} />
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-shrink-0">
            {days.map((date) => {
              const { day, num } = formatDisplayDate(date);
              const count = checklistsByDate.get(date)?.length ?? 0;
              const todayDate = isToday(date);
              const selected = selectedDay === date;
              return (
                <button key={date} onClick={() => setSelectedDay(date)}
                  className="flex-1 rounded-[var(--radius-md)] py-3 px-2 transition-all duration-150 relative"
                  style={selected ? {
                    background: "rgba(var(--accent-rgb), 0.15)",
                    border: "1px solid rgba(var(--accent-rgb), 0.35)",
                  } : todayDate ? {
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(var(--accent-rgb), 0.20)",
                  } : {
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}>
                  <div className="text-[11px] font-medium mb-1" style={{ color: selected ? "var(--accent)" : "var(--text-muted)" }}>{day}</div>
                  <div className="text-base font-bold" style={{ color: selected ? "var(--accent)" : todayDate ? "white" : "var(--text-secondary)" }}>{num}</div>
                  {count > 0 && (
                    <div className="mt-1.5 flex justify-center gap-0.5">
                      {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full" style={{ background: selected ? "var(--accent)" : "rgba(255,255,255,0.3)" }} />
                      ))}
                    </div>
                  )}
                  {todayDate && (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{selDay}, {selNum}</span>
                {isToday(selectedDay) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(var(--accent-rgb),0.15)", color: "var(--accent)" }}>TODAY</span>
                )}
              </div>
              <Button variant="accent" size="sm" onClick={() => openNew(selectedDay)}>
                <Plus size={14} /> Add Checklist
              </Button>
            </div>

            <AnimatePresence mode="popLayout">
              {dayItems.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyState
                    icon={<Calendar size={24} style={{ color: "var(--text-muted)" }} />}
                    message="Nothing planned for this day"
                    actionLabel="Plan Something"
                    onAction={() => openNew(selectedDay)}
                  />
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {dayItems.map(renderChecklist)}
                  </AnimatePresence>
                </div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      <ChecklistModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        initial={editing}
        defaultDate={modalDate}
        onSave={handleSave}
      />
    </div>
  );
}
