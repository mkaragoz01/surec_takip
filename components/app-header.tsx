"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, LayoutGrid, ListChecks, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Kanban", icon: LayoutGrid },
  { href: "/archive", label: "Arşiv", icon: Archive },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm shadow-blue-500/30">
            <ListChecks size={17} />
          </span>
          <div>
            <h1 className="text-[15px] font-semibold leading-tight text-slate-800">İş Takip</h1>
            <p className="text-xs leading-tight text-slate-400">İşlerini süreçler arasında takip et.</p>
          </div>
        </div>
        <nav className="flex gap-0.5 rounded-lg bg-slate-100/80 p-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition",
                  active ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Icon size={14} strokeWidth={2.25} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
