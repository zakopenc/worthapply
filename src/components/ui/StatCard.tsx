import { cn } from "@/lib/utils";
import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string; // Material Symbol icon name
  variant?: "default" | "primary" | "secondary";
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  variant = "default",
  trend,
  className,
}: StatCardProps) {
  const variantStyles = {
    default: "bg-surface-container-lowest",
    primary: "bg-primary text-on-primary",
    secondary: "bg-secondary text-on-secondary",
  };

  return (
    <Card
      className={cn(
        "p-6 flex flex-col justify-between min-h-[160px]",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "text-xs font-bold uppercase tracking-widest",
            variant === "default"
              ? "text-on-surface-variant"
              : "opacity-70"
          )}
        >
          {label}
        </span>
        {icon && (
          <span
            className={cn(
              "material-symbols-outlined text-2xl",
              variant === "default"
                ? "text-secondary"
                : "opacity-40"
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between mt-4">
        <div className="text-4xl font-black tracking-tight">{value}</div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-bold",
              trend.direction === "up" ? "text-green-600" : "text-red-600"
            )}
          >
            <span className="material-symbols-outlined text-base">
              {trend.direction === "up" ? "trending_up" : "trending_down"}
            </span>
            {trend.value}
          </div>
        )}
      </div>
    </Card>
  );
}
