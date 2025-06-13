
import { ReactNode, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TouchCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "filled";
}

export const TouchCard = forwardRef<HTMLDivElement, TouchCardProps>(
  ({ children, title, subtitle, onClick, className, size = "md", variant = "default" }, ref) => {
    const isClickable = !!onClick;
    
    const sizeClasses = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8"
    };

    const variantClasses = {
      default: "bg-card",
      outline: "border-2 border-primary/20 bg-card",
      filled: "bg-primary/5 border-primary/10"
    };

    return (
      <Card
        ref={ref}
        onClick={onClick}
        className={cn(
          "transition-all duration-200 touch-manipulation",
          variantClasses[variant],
          isClickable && "cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
          className
        )}
      >
        {title && (
          <CardHeader className={cn("pb-2", sizeClasses[size])}>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </CardHeader>
        )}
        <CardContent className={cn(title ? "pt-0" : "", sizeClasses[size])}>
          {children}
        </CardContent>
      </Card>
    );
  }
);

TouchCard.displayName = "TouchCard";
