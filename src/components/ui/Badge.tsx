import { cn } from "@/lib/utils";

type BadgeVariant = "high" | "medium" | "low" | "applied" | "interview" | "offer" | "rejected" | "wishlist" | "saved" | "default";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  high: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-red-100 text-red-700",
  applied: "bg-blue-500 text-white",
  interview: "bg-orange-500 text-white",
  offer: "bg-green-500 text-white",
  rejected: "bg-red-500 text-white",
  wishlist: "bg-amber-500 text-white",
  saved: "bg-gray-400 text-white",
  default: "bg-surface-container text-on-surface",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
