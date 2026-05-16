import { useMemo } from "react";
import { buildCalendarCells, toISODate } from "../../lib/utils";
import { MONTH_NAMES_SHORT } from "../../lib/constants";
import type { Checklist } from "../../types";

interface YearCalendarProps {
  year: number;
  checklistsByDate: Map<string, Checklist[]>;
  onMonthClick: (month: number) => void;
}

interface MiniMonthProps {
  year: number;
  month: number;
  todayIso: string;
  checklistsByDate: Map<string, Checklist[]>;
  onMonthClick: () => void;
}

function MiniMonth({ year, month, todayIso, checklistsByDate, onMonthClick }: MiniMonthProps) {
  const isCurrentMonth = todayIso.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`);
  const cells = useMemo(() => buildCalendarCells(year, month), [year, month]);

  return (
    <button
      onClick={onMonthClick}
      className="p-3 rounded-[var(--radius-md)] transition-all hover:bg-white/[0.06] text-left"
      style={isCurrentMonth ? { border: "1px solid rgba(var(--accent-rgb),0.3)", background: "rgba(var(--accent-rgb),0.06)" } : { border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="text-xs font-semibold mb-2" style={{ color: isCurrentMonth ? "var(--accent)" : "var(--text-secondary)" }}>
        {MONTH_NAMES_SHORT[month]}
      </div>
      <div className="grid grid-cols-7 gap-y-px">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="w-3 h-2" />;
          const iso = toISODate(year, month, day);
          const count = checklistsByDate.get(iso)?.length ?? 0;
          const isToday = iso === todayIso;
          return (
            <div key={i} className="w-3 h-2 rounded-sm flex items-center justify-center"
              style={isToday
                ? { background: "var(--accent)", opacity: 1 }
                : count > 0
                ? { background: "rgba(var(--accent-rgb),0.4)", opacity: Math.min(0.3 + count * 0.2, 1) }
                : {}}
            />
          );
        })}
      </div>
    </button>
  );
}

export function YearCalendar({ year, checklistsByDate, onMonthClick }: YearCalendarProps) {
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pb-4">
      {Array.from({ length: 12 }, (_, m) => (
        <MiniMonth
          key={m}
          year={year}
          month={m}
          todayIso={todayIso}
          checklistsByDate={checklistsByDate}
          onMonthClick={() => onMonthClick(m)}
        />
      ))}
    </div>
  );
}
