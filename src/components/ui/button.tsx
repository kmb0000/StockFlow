import { cn } from "@/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

const variants = {
  primary:
    "bg-(--primary) text-white hover:opacity-90 shadow-sm shadow-blue-500/20",
  secondary:
    "border border-(--border) text-(--text-secondary) hover:bg-white/5 hover:text-(--text-primary)",
  danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20",
};

export default function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
