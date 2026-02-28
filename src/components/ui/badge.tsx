import { cn } from "@/utils/cn";

type BadgeProps = {
  children: React.ReactNode;
  variant: "success" | "warning" | "danger" | "blue" | "neutral";
  className?: string;
};

const variants = {
  // Utilisation des variables CSS et de l'opacité
  success: "bg-green-500/10 text-green-500 border border-green-500/20",
  warning: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
  danger: "bg-red-500/10 text-red-500 border border-red-500/20",
  blue: "bg-(--primary)/10 text-(--primary) border border-(--primary)/20",
  neutral:
    "bg-(--text-secondary)/10 text-(--text-secondary) border border-(--border)",
};

export default function Badge({ children, variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
