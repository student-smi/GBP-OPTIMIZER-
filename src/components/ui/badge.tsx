import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "info";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    // 90% White / 10% Black minimalist badges
    default: "bg-[#111111] text-white border-transparent",
    secondary: "bg-[#F5F5F5] text-[#111111] border-[#E5E5E5]",
    outline: "bg-white text-[#111111] border-[#E5E5E5]",
    success: "bg-[#111111] text-white border-transparent",
    warning: "bg-[#F0F0F0] text-[#111111] border-[#D5D5D5]",
    destructive: "bg-[#333333] text-white border-transparent",
    info: "bg-[#F7F7F7] text-[#444444] border-[#E5E5E5]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
