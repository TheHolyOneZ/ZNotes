import { Search, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search...", className }: SearchBarProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search size={14} className="absolute left-3 pointer-events-none" style={{ color: "var(--text-muted)" }} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="glass-input w-full pl-9 pr-8 py-2 text-sm rounded-xl"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 hover:text-white transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
