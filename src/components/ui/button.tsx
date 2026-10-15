import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      // Primary: Pure Black background with crisp White text (10% Black)
      default:
        "bg-[#111111] text-white hover:bg-black shadow-sm",
      // Accent: Also Black for strict 90/10 compliance
      accent:
        "bg-[#111111] text-white hover:bg-black shadow-sm",
      // Secondary: Very light gray background with black text
      secondary:
        "bg-[#F5F5F5] text-[#111111] hover:bg-[#EAEAEA] border border-[#E5E5E5]",
      // Outline: Pure white with thin border and black text
      outline:
        "border border-[#E5E5E5] bg-white text-[#111111] hover:bg-[#F9F9F9]",
      // Ghost: Clear hover
      ghost:
        "hover:bg-[#F5F5F5] text-[#111111]",
      // Destructive: Dark slate/black with subtle indication
      destructive:
        "bg-[#222222] text-white hover:bg-black",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-11 px-6 text-sm gap-2 font-semibold",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
