"use client";

import { cn } from "@/utils/cn";
import { useId } from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

export default function Select({
  children,
  label,
  error,
  id,
  className,
  ...props
}: SelectProps) {
  const generateId = useId();
  const selectId = id ?? generateId;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        className="text-sm font-semibold text-(--text-primary) ml-1"
        htmlFor={selectId}
      >
        {label}
      </label>
      <select
        id={selectId}
        className={cn(
          "w-full px-4 py-2.5 bg-(--bg-dark) border border-(--border) rounded-lg text-(--text-primary) text-sm transition-all outline-none cursor-pointer appearance-none",
          "focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/10",
          error && "border-red-500 focus:ring-red-500/10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <span className="text-xs font-medium text-red-500 ml-1">{error}</span>
      )}
    </div>
  );
}
