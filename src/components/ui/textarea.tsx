"use client";

import { cn } from "@/utils/cn";
import { useId } from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export default function Textarea({
  label,
  error,
  id,
  className,
  ...props
}: TextareaProps) {
  const generateId = useId();
  const textareaId = id ?? generateId;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        className="text-sm font-semibold text-(--text-primary) ml-1"
        htmlFor={textareaId}
      >
        {label}
      </label>
      <textarea
        id={textareaId}
        className={cn(
          "w-full px-4 py-2.5 bg-(--bg-dark) border border-(--border) rounded-lg text-(--text-primary) text-sm transition-all outline-none min-h-[100px] resize-y",
          "focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/10",
          "placeholder:text-(--text-secondary)/50",
          error && "border-red-500 focus:ring-red-500/10",
          className,
        )}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-red-500 ml-1">{error}</span>
      )}
    </div>
  );
}
