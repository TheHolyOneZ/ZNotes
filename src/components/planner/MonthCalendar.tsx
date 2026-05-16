import { useMemo } from "react";
import { buildCalendarCells, toISODate } from "../../lib/utils";
import { DAYS_OF_WEEK } from "../../lib/constants";
import type { Checklist } from "../../types";

interface MonthCalendarProps {
  year: number;
  month: number;
  checklistsByDate: Map<string, Checklist[]>;
  selectedDay: string;
  onDayClick: (date: string) => void;
}

export function MonthCalendar({ year, month, checklistsByDate, selectedDay, onDayClick }: MonthCalendarProps) {
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const cells = useMemo(() => buildCalendarCells(year, month), [year, month]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 mb-1">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium py-1" style={{ color: "var(--text-muted)" }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const iso = toISODate(year, month, day);
          const count = checklistsByDate.get(iso)?.length ?? 0;
          const isToday = iso === todayIso;
          const isSelected = iso === selectedDay;

          return (
            <button
              key={i}
              onClick={() => onDayClick(iso)}
              className="flex flex-col items-center py-2 px-1 rounded-[var(--radius-sm)] transition-all hover:bg-white/[0.06]"
              style={isSelected ? {
                background: "rgba(var(--accent-rgb),0.15)",
                border: "1px solid rgba(var(--accent-rgb),0.35)",
              } : isToday ? {
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(var(--accent-rgb),0.2)",
              } : { border: "1px solid transparent" }}
            >
              <span className="text-sm font-semibold"
                style={{ color: isSelected || isToday ? "var(--accent)" : "var(--text-secondary)" }}>
                {day}
              </span>
              {count > 0 && (
                <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                  {Array.from({ length: Math.min(count, 3) }).map((_, di) => (
                    <div key={di} className="w-1 h-1 rounded-full"
                      style={{ background: isSelected ? "var(--accent)" : "rgba(255,255,255,0.3)", opacity: 1 - di * 0.25 }} />
                  ))}
                  {count > 3 && <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>+{count - 3}</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
