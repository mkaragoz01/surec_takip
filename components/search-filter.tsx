"use client";

import { ListFilter, Search } from "lucide-react";
import type { Priority } from "@/lib/types";

type SearchFilterProps = {
  search: string;
  onSearchChange: (value: string) => void;
  priority: Priority | "ALL";
  onPriorityChange: (value: Priority | "ALL") => void;
};

export function SearchFilter({ search, onSearchChange, priority, onPriorityChange }: SearchFilterProps) {
  return (
    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Kartlarda ara..."
          className="w-full rounded-lg border border-transparent bg-slate-100/70 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-slate-200 focus:bg-white focus:outline-none"
        />
      </div>
      <div className="relative">
        <ListFilter
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <select
          value={priority}
          onChange={(event) => onPriorityChange(event.target.value as Priority | "ALL")}
          className="cursor-pointer appearance-none rounded-lg border border-transparent bg-slate-100/70 py-2 pl-8 pr-8 text-sm text-slate-600 transition focus:border-slate-200 focus:bg-white focus:outline-none"
        >
          <option value="ALL">Tüm öncelikler</option>
          <option value="LOW">Düşük</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">Yüksek</option>
        </select>
      </div>
    </div>
  );
}
