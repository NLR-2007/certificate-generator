import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && (
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 bg-white dark:bg-slate-950/80 border rounded-xl text-slate-900 dark:text-white text-sm placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-200 dark:disabled:bg-slate-900 disabled:text-slate-500",
            error ? "border-red-500/80 focus:ring-red-500" : "border-slate-200 dark:border-slate-800",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
