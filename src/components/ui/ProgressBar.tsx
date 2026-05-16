import { cn } from "../../lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, className, showLabel = false }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  const color = pct === 100 ? "#10b981" : pct >= 50 ? "var(--accent)" : "#f59e0b";

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-[11px]" style={{ color: "var(--text-secondary)" }}>
          <span>Progress</span>
          <span style={{ color }}>{pct}%</span>
        </div>
      )}
      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color, boxShadow: pct > 0 ? `0 0 8px ${color}60` : "none" }}
        />
      </div>
    </div>
  );
}
