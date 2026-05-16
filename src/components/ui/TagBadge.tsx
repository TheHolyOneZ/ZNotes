import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  small?: boolean;
  className?: string;
}

export function TagBadge({ tag, onRemove, small = false, className }: TagBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full font-medium",
      small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
      "bg-[rgba(var(--accent-rgb),0.15)] text-[var(--accent)] border border-[rgba(var(--accent-rgb),0.25)]",
      className
    )}>
      {tag}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-white transition-colors ml-0.5">
          <X size={10} strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}
