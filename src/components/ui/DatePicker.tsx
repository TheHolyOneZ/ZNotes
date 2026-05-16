import { useState, useCallback, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarGrid } from "./CalendarGrid";
import { MONTH_NAMES_FULL } from "../../lib/constants";
import { toISODate, today } from "../../lib/utils";

interface DatePickerProps {
  value: string | null;
  onChange: (v: string | null) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const todayIso = useMemo(() => today(), []);
  const parsed = value ? new Date(value + "T12:00:00") : null;
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? new Date().getMonth());

  const prevMonth = useCallback(() => setViewMonth((m) => { if (m === 0) { setViewYear((y) => y - 1); return 11; } return m - 1; }), []);
  const nextMonth = useCallback(() => setViewMonth((m) => { if (m === 11) { setViewYear((y) => y + 1); return 0; } return m + 1; }), []);

  const handleDayClick = useCallback((day: number) => {
    onChange(toISODate(viewYear, viewMonth, day));
    setOpen(false);
  }, [viewYear, viewMonth, onChange]);

  const goToday = useCallback(() => {
    onChange(todayIso);
    setOpen(false);
  }, [onChange, todayIso]);

  const displayValue = parsed?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) ?? null;

  return (
    <Popover.Root open={open} onOpenChange={(o) => {
      setOpen(o);
      if (o && parsed) { setViewYear(parsed.getFullYear()); setViewMonth(parsed.getMonth()); }
    }}>
      <Popover.Trigger asChild>
        <button
          className={`glass-input w-full px-3 py-2 rounded-[var(--radius-md)] text-sm flex items-center gap-2 text-left ${className ?? ""}`}
          style={{ color: displayValue ? "var(--text-primary)" : "var(--text-muted)" }}
        >
          <Calendar size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <span className="flex-1 truncate">{displayValue ?? placeholder}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={6} align="start" style={{ outline: "none", zIndex: 300 }}
          className="glass-md rounded-[var(--radius-lg)] p-3 shadow-2xl w-60">
          <div className="flex items-center justify-between mb-2">
            <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" style={{ color: "var(--text-muted)" }}>
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{MONTH_NAMES_FULL[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" style={{ color: "var(--text-muted)" }}>
              <ChevronRight size={14} />
            </button>
          </div>
          <CalendarGrid
            viewYear={viewYear}
            viewMonth={viewMonth}
            selectedIso={value}
            todayIso={todayIso}
            onDayClick={handleDayClick}
          />
          <div className="flex gap-2 mt-2 pt-2 border-t border-white/[0.07]">
            <button onClick={goToday} className="flex-1 text-[11px] py-1 rounded-md hover:bg-white/10 transition-colors" style={{ color: "var(--accent)" }}>Today</button>
            {value && (
              <button onClick={() => { onChange(null); setOpen(false); }} className="flex-1 text-[11px] py-1 rounded-md hover:bg-white/10 transition-colors" style={{ color: "var(--text-muted)" }}>Clear</button>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
