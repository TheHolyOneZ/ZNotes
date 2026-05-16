import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "xs" | "sm" | "md" | "lg";
  glow?: boolean;
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "sm", glow = false, hover = false, children, ...props }, ref) => {
    const variantClass = {
      xs: "glass-xs",
      sm: "glass-sm",
      md: "glass",
      lg: "glass-md",
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(
          variantClass,
          "rounded-[var(--radius-lg)]",
          glow && "accent-glow",
          hover && "transition-all duration-200 hover:bg-white/[0.09] hover:border-white/[0.14] cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";
