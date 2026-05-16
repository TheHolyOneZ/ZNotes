import type { ReactNode } from "react";
import { Button } from "./Button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  icon: ReactNode;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 pb-12">
      <div className="w-16 h-16 rounded-2xl glass-sm flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{message}</p>
      {actionLabel && onAction && (
        <Button variant="accent" size="sm" onClick={onAction}>
          <Plus size={14} /> {actionLabel}
        </Button>
      )}
    </div>
  );
}
