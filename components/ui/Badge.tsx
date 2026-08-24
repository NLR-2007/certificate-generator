import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "danger" | "warning" | "info" | "neutral";
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = "info", children, ...props }) => {
  const variants = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    neutral: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide backdrop-blur-md",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
