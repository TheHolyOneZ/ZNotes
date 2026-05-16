import * as RadixSelect from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ options, value, onChange, placeholder, className }: SelectProps) {
  const selected = options.find((o) => o.value === value);
  return (
    <RadixSelect.Root value={value} onValueChange={onChange}>
      <RadixSelect.Trigger
        className={`glass-input flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-sm outline-none w-full ${className ?? ""}`}
        style={{ color: selected?.color ?? "var(--text-secondary)" }}
      >
        {selected?.color && (
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: selected.color }} />
        )}
        <RadixSelect.Value placeholder={placeholder ?? "Select..."} />
        <RadixSelect.Icon className="ml-auto flex-shrink-0">
          <ChevronDown size={12} style={{ color: "var(--text-muted)" }} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          style={{ zIndex: 300 }}
          className="glass-md rounded-[var(--radius-lg)] py-1 shadow-2xl min-w-[var(--radix-select-trigger-width)]"
        >
          <RadixSelect.Viewport>
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer outline-none rounded-lg mx-1 hover:bg-white/10 transition-colors"
                style={{ color: opt.color ?? "var(--text-secondary)" }}
              >
                {opt.color && (
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: opt.color }} />
                )}
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="ml-auto">
                  <Check size={11} style={{ color: "var(--accent)" }} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
