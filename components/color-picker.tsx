"use client";

import { cn } from "@/lib/utils";

export const LIGHT_PRESET_COLORS = [
  "#F1F1EF",
  "#F4EEEE",
  "#FBECDD",
  "#FBF3DB",
  "#EDF3EC",
  "#E7F3F8",
  "#F6F3F9",
  "#FAF1F5",
  "#FDEBEC",
];

export const ACCENT_PRESET_COLORS = [
  "#787774",
  "#9F6B53",
  "#D9730D",
  "#CB912F",
  "#448361",
  "#337EA9",
  "#9065B0",
  "#C14C8A",
  "#D44C47",
];

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  presets?: string[];
};

export function ColorPicker({ label, value, onChange, presets = LIGHT_PRESET_COLORS }: ColorPickerProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              "h-6 w-6 rounded-full border transition",
              value.toLowerCase() === color.toLowerCase()
                ? "border-slate-800 ring-2 ring-slate-800 ring-offset-2"
                : "border-black/10 hover:scale-110"
            )}
            style={{ backgroundColor: color }}
            aria-label={color}
          />
        ))}
        <input
          type="color"
          value={/^#([0-9A-Fa-f]{6})$/.test(value) ? value : presets[0]}
          onChange={(event) => onChange(event.target.value)}
          className="h-6 w-8 cursor-pointer rounded border border-slate-200 bg-transparent p-0"
          aria-label={`${label} özel renk`}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-24 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600"
          placeholder={presets[0]}
        />
      </div>
    </div>
  );
}
