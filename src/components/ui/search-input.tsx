import { Search } from "lucide-react";

type SearchBarProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function SearchBar({ ...props }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-secondary)" />
      <input
        className="w-full pl-10 pr-4 py-3 bg-(--bg-dark) border border-(--border) rounded-lg text-sm text-(--text-primary) outline-none transition-all focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(0,102,255,0.1)] placeholder:text-(--text-secondary)"
        {...props}
      />
    </div>
  );
}
