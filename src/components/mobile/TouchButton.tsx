
import { ReactNode, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TouchButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ children, size = "lg", fullWidth = false, className, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-10 px-4 text-sm",
      md: "h-12 px-6 text-base",
      lg: "h-14 px-8 text-lg font-medium",
      xl: "h-16 px-10 text-xl font-semibold"
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "touch-manipulation transition-all duration-200",
          "active:scale-95 disabled:active:scale-100",
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

TouchButton.displayName = "TouchButton";
