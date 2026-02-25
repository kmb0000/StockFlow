import { cn } from "@/utils/cn";

//Ajoute la nouvelle valeur de l'objet pour TS
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
};
//objet qui contient le style réel
const variants = {
  primary: "bg-[#0066FF] text-white hover:bg-[#0052CC]",
  secondary: "border border-[#1F2937] text-[#9CA3AF]",
  danger: "bg-[#EF4444] text-white",
};

const baseClasses =
  "inline-flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200";

export default function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(baseClasses, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
