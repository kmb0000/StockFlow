import { cn } from "@/utils/cn";
import { useId } from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  children?: React.ReactNode;
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
    <div className="flex flex-col gap-2">
      <label
        className="text-sm font-medium text-[#F9FAFB] opacity-50"
        htmlFor={selectId}
      >
        {label}
      </label>
      <select
        className={cn(
          "w-full px-4 py-3 bg-[#0A0E1A] border border-[#1F2937] rounded-lg text-[#F9FAFB] text-sm transition-all outline-none focus:border-[#0066FF] focus:shadow-[0_0_0_3px_rgba(0,102,255,0.1)] placeholder:text-[#9CA3AF] cursor-pointer",
          error && "border-[#EF4444]",
          className,
        )}
        id={selectId}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-sm text-[#EF4444]">{error}</span>}
    </div>
  );
}
