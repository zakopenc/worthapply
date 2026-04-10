"use client";

import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  size = "md",
  label,
  showValue = true,
  className,
}: CircularProgressProps) {
  const sizeStyles = {
    sm: {
      outer: "w-24 h-24",
      inner: "w-20 h-20",
      text: "text-xl",
      subtext: "text-[8px]",
    },
    md: {
      outer: "w-40 h-40",
      inner: "w-32 h-32",
      text: "text-4xl",
      subtext: "text-[10px]",
    },
    lg: {
      outer: "w-48 h-48",
      inner: "w-40 h-40",
      text: "text-5xl",
      subtext: "text-xs",
    },
  };

  const styles = sizeStyles[size];
  const rotation = (value / 100) * 360;

  return (
    <div className={cn("relative", styles.outer, className)}>
      <div
        className={cn(
          "w-full h-full rounded-full flex items-center justify-center",
          "bg-surface-container-highest"
        )}
        style={{
          background: `conic-gradient(#84523c ${rotation}deg, #eae8e4 0deg)`,
        }}
      >
        <div
          className={cn(
            "bg-surface-container-lowest rounded-full flex flex-col items-center justify-center",
            styles.inner
          )}
        >
          {showValue && (
            <>
              <span
                className={cn(
                  "font-black text-on-surface leading-none",
                  styles.text
                )}
              >
                {value}%
              </span>
              {label && (
                <span
                  className={cn(
                    "font-bold uppercase tracking-tighter text-on-surface/40 mt-1",
                    styles.subtext
                  )}
                >
                  {label}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
