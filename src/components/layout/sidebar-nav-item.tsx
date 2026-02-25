"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

type SidebarItemProps = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

export default function SidebarItem({ href, label, Icon }: SidebarItemProps) {
  const pathName = usePathname();
  const isActive =
    href === "/dashboard"
      ? pathName === "/dashboard"
      : pathName.startsWith(href);

  return (
    <Link
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
        isActive
          ? "bg-blue-500/10 text-blue-500"
          : "text-(--text-secondary) hover:bg-white/5 hover:text-(--text-primary)",
      )}
      href={href}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
}
