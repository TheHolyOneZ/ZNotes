import { useState, useCallback, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { CalendarGrid } from "./CalendarGrid";
import { MONTH_NAMES_FULL } from "../../lib/constants";
import { toISODate, today } from "../../lib/utils";

interface DateTimePickerProps {
  value: string | null;
  onChange: (v: string | null) => void;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({ value, onChange, placeholder = "Pick date & time", className }: DateTimePickerProps) {
  const todayIso = useMemo(() => today(), []);
  const parsed = value ? new Date(value) : null;
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? new Date().getMonth());
  const [selDate, setSelDate] = useState<string | null>(parsed ? parsed.toISOString().slice(0, 10) : null);
  const [hour, setHour] = useState(parsed?.getHours() ?? 9);
  const [minute, setMinute] = useState(parsed?.getMinutes() ?? 0);

  const prevMonth = useCallback(() => setViewMonth((m) => { if (m === 0) { setViewYear((y) => y - 1); return 11; } return m - 1; }), []);
  const nextMonth = useCallback(() => setViewMonth((m) => { if (m === 11) { setViewYear((y) => y + 1); return 0; } return m + 1; }), []);

  const handleDayClick = useCallback((day: number) => {
    setSelDate(toISODate(viewYear, viewMonth, day));
  }, [viewYear, viewMonth]);

  const confirm = useCallback(() => {
    if (!selDate) return;
    const d = new Date(`${selDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`);
    onChange(d.toISOString());
    setOpen(false);
  }, [selDate, hour, minute, onChange]);

  const setNow = useCallback(() => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    setSelDate(t.toISOString().slice(0, 10));
    setHour(t.getHours());
    setMinute(t.getMinutes());
  }, []);

  const displayValue = parsed
    ? parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " " +
      parsed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <Popover.Root open={open} onOpenChange={(o) => {
      setOpen(o);
      if (o && parsed) {
        setViewYear(parsed.getFullYear()); setViewMonth(parsed.getMonth());
        setSelDate(parsed.toISOString().slice(0, 10));
        setHour(parsed.getHours()); setMinute(parsed.getMinutes());
      }
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
          className="glass-md rounded-[var(--radius-lg)] p-3 shadow-2xl w-64">
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
            selectedIso={selDate}
            todayIso={todayIso}
            onDayClick={handleDayClick}
          />
          <div className="mt-3 pt-2 border-t border-white/[0.07]">
            <div className="flex items-center gap-2">
              <Clock size={12} style={{ color: "var(--text-muted)" }} />
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Time</span>
              <div className="flex items-center gap-1 ml-auto">
                <input type="number" min={0} max={23} value={String(hour).padStart(2, "0")}
                  onChange={(e) => setHour(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                  className="glass-input w-12 text-center px-1 py-1 rounded-lg text-xs"
                  style={{ color: "var(--text-primary)" }} />
                <span style={{ color: "var(--text-muted)" }}>:</span>
                <input type="number" min={0} max={59} value={String(minute).padStart(2, "0")}
                  onChange={(e) => setMinute(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="glass-input w-12 text-center px-1 py-1 rounded-lg text-xs"
                  style={{ color: "var(--text-primary)" }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button onClick={setNow} className="text-[11px] px-2 py-1 rounded-md hover:bg-white/10 transition-colors" style={{ color: "var(--text-muted)" }}>Now</button>
            {value && (
              <button onClick={() => { onChange(null); setOpen(false); }} className="text-[11px] px-2 py-1 rounded-md hover:bg-white/10 transition-colors ml-auto" style={{ color: "var(--text-muted)" }}>Clear</button>
            )}
            <button onClick={confirm} disabled={!selDate}
              className={`text-[11px] px-3 py-1 rounded-md font-medium transition-all disabled:opacity-40 ${value ? "" : "ml-auto"}`}
              style={{ background: "var(--accent)", color: "white" }}>
              Set
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
