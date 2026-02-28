import { Search } from "lucide-react";
import { cn } from "@/utils/cn";

type SearchBarProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function SearchBar({ className, ...props }: SearchBarProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-secondary)" />
      <input
        className="w-full pl-10 pr-4 py-2.5 bg-(--bg-dark) border border-(--border) rounded-lg text-sm text-(--text-primary) outline-none transition-all focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/10 placeholder:text-(--text-secondary)/50"
        {...props}
      />
    </div>
  );
}
