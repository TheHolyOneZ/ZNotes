import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "accent" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "ghost", size = "md", children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none";

    const variants = {
      accent: "text-white active:scale-95",
      ghost: "hover:bg-white/10 active:bg-white/15",
      danger: "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 active:scale-95",
      outline: "bg-transparent border border-white/[0.12] hover:bg-white/[0.06] active:scale-95",
    };

    const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };

    const accentStyle = variant === "accent" ? {
      background: "var(--accent)",
      boxShadow: "0 0 20px rgba(var(--accent-rgb),0.25)",
    } : {};

    const textStyle = !["accent", "danger"].includes(variant)
      ? { color: "var(--text-secondary)" } : {};

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        style={{ ...accentStyle, ...textStyle }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
