"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p === "/" },
  { href: "/clients", label: "Clients", icon: Users, match: (p: string) => p.startsWith("/clients") },
];

export function Sidebar() {
  const pathname = usePathname() ?? "/";

  return (
    <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-[240px] bg-white border-r border-hairline px-4 py-6 z-20">
      <Link href="/" className="px-3 pb-6 mb-2 block">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-ink text-white grid place-items-center font-semibold tracking-tight">
            PM
          </div>
          <div className="text-[15px] font-semibold tracking-tight">PM</div>
        </div>
      </Link>

      <nav className="flex-1 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-[14px] transition-colors",
                active
                  ? "bg-sidebar-active text-ink font-medium"
                  : "text-ink-muted hover:bg-[#F7F7F5]",
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
