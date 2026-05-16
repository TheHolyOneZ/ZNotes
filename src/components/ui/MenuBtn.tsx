import type { ReactNode } from "react";

interface MenuBtnProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export function MenuBtn({ icon, label, onClick, danger = false }: MenuBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${danger ? "hover:bg-rose-500/20 text-rose-400" : "hover:bg-white/10"}`}
      style={!danger ? { color: "var(--text-secondary)" } : {}}
    >
      {icon} {label}
    </button>
  );
}
