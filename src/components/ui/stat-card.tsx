import { cn } from "@/utils/cn";
import { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  Icon: LucideIcon;
  variant: "blue" | "green" | "yellow" | "red";
  change: string;
  changeType: "positive" | "negative";
  className?: string;
};
const iconVariants = {
  blue: "bg-[rgba(0,102,255,0.1)] text-[#0066FF]",
  green: "bg-[rgba(16,185,129,0.1)] text-[#10B981]",
  yellow: "bg-[rgba(245,158,11,0.1)] text-[#F59E0B]",
  red: "bg-[rgba(239,68,68,0.1)] text-[#EF4444]",
};

export default function StatCard({
  label,
  value,
  Icon,
  variant,
  change,
  changeType,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-(--bg-card) border border-(--border) px-4 py-4 flex flex-col gap-3 rounded-xl hover:border-(--primary) transition-all duration-200 hover:-translate-y-1",
        className,
      )}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-md text-(--text-secondary)">{label}</h3>
        <div
          className={cn(
            "w-12 h-12 rounded-lg  flex items-center justify-center",
            iconVariants[variant],
            className,
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <span className="text-4xl font-bold">{value}</span>
      <span
        className={cn(
          "text-sm",
          changeType === "positive" ? "text-[#10B981]" : "text-[#EF4444]",
        )}
      >
        {change}
      </span>
    </div>
  );
}
