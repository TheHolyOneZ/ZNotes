import { useMemo } from "react";
import { DAYS_OF_WEEK } from "../../lib/constants";
import { buildCalendarCells } from "../../lib/utils";

interface CalendarGridProps {
  viewYear: number;
  viewMonth: number;
  selectedIso: string | null;
  todayIso: string;
  onDayClick: (day: number) => void;
}

export function CalendarGrid({ viewYear, viewMonth, selectedIso, todayIso, onDayClick }: CalendarGridProps) {
  const cells = useMemo(() => buildCalendarCells(viewYear, viewMonth), [viewYear, viewMonth]);

  const selectedDay = selectedIso?.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`)
    ? parseInt(selectedIso.slice(8), 10) : null;
  const todayDay = todayIso.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`)
    ? parseInt(todayIso.slice(8), 10) : null;

  return (
    <>
      <div className="grid grid-cols-7 mb-0.5">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="text-center text-[9px] font-medium py-0.5" style={{ color: "var(--text-muted)" }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => (
          <button key={i} disabled={!day} onClick={() => day && onDayClick(day)}
            className="w-8 h-7 mx-auto flex items-center justify-center rounded-md text-[11px] font-medium transition-all"
            style={day ? {
              background: day === selectedDay ? "var(--accent)" : day === todayDay ? "rgba(var(--accent-rgb),0.15)" : "transparent",
              color: day === selectedDay ? "white" : day === todayDay ? "var(--accent)" : "var(--text-secondary)",
              border: day === todayDay && day !== selectedDay ? "1px solid rgba(var(--accent-rgb),0.3)" : "1px solid transparent",
            } : { cursor: "default", opacity: 0 }}
          >
            {day ?? ""}
          </button>
        ))}
      </div>
    </>
  );
}
