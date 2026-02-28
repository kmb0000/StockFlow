import { cn } from "@/utils/cn";
import { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  Icon: LucideIcon;
  variant: "blue" | "green" | "yellow" | "red";
  change?: string;
  changeType?: "positive" | "negative";
  className?: string;
};

const iconVariants = {
  blue: "bg-blue-500/10 text-blue-500",
  green: "bg-green-500/10 text-green-500",
  yellow: "bg-yellow-500/10 text-yellow-500",
  red: "bg-red-500/10 text-red-500",
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
        "bg-(--bg-card) border border-(--border) p-5 rounded-xl flex flex-col gap-3 transition-all duration-200 hover:shadow-lg hover:border-(--primary)/50",
        className, // Appliqué uniquement ici pour le layout
      )}
    >
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-(--text-secondary)">{label}</p>
        <div className={cn("p-2.5 rounded-lg shrink-0", iconVariants[variant])}>
          <Icon size={20} />
        </div>
      </div>

      <div>
        <h4 className="text-2xl font-bold tracking-tight">{value}</h4>
        {change && (
          <p
            className={cn(
              "text-xs font-medium mt-1",
              changeType === "positive" ? "text-green-500" : "text-red-500",
            )}
          >
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
