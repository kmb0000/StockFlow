import { cn } from "@/utils/cn";

type BadgeProps = {
  children: React.ReactNode;
  variant: "success" | "warning" | "danger";
  className?: string;
};

const variants = {
  success: "bg-[rgba(16,185,129,0.1)] text-[#10B981]",
  warning: "bg-[rgba(245,158,11,0.1)] text-[#F59E0B]",
  danger: "bg-[rgba(239,68,68,0.1)] text-[#EF4444]",
};

const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";

export default function Badge({
  children,
  variant,
  className,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(baseClasses, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
