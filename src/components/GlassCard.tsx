import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export const GlassCard = ({ children, className, hover = true, glow = false }: GlassCardProps) => (
  <div
    className={cn(
      "glass-card rounded-2xl p-6",
      hover && "hover-lift",
      glow && "hover-glow",
      className
    )}
  >
    {children}
  </div>
);
