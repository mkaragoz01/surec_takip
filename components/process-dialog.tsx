"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { processFormSchema, type ProcessFormValues } from "@/lib/validations";
import { ColorPicker, LIGHT_PRESET_COLORS, ACCENT_PRESET_COLORS } from "@/components/color-picker";
import type { ProcessDTO } from "@/lib/types";

type ProcessDialogProps = {
  open: boolean;
  process?: ProcessDTO | null;
  onClose: () => void;
  onSubmit: (values: ProcessFormValues) => Promise<void>;
};

export function ProcessDialog({ open, process, onClose, onSubmit }: ProcessDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProcessFormValues>({
    resolver: zodResolver(processFormSchema),
    defaultValues: {
      name: "",
      columnColor: LIGHT_PRESET_COLORS[0],
      badgeColor: ACCENT_PRESET_COLORS[0],
      isCompletedProcess: false,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: process?.name ?? "",
      columnColor: process?.columnColor ?? LIGHT_PRESET_COLORS[0],
      badgeColor: process?.badgeColor ?? ACCENT_PRESET_COLORS[0],
      isCompletedProcess: process?.isCompletedProcess ?? false,
    });
  }, [open, process, reset]);

  if (!open) return null;

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    onClose();
  });

  const columnColor = watch("columnColor");
  const badgeColor = watch("badgeColor");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl shadow-slate-900/10">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-800">
            {process ? "Süreci Düzenle" : "Yeni Süreç"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Süreç Adı</label>
            <input
              {...register("name")}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-700 transition focus:border-slate-300 focus:bg-white focus:outline-none"
              placeholder="Örn: İnceleniyor"
              autoFocus
            />
            {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
          </div>

          <Controller
            control={control}
            name="columnColor"
            render={({ field }) => (
              <ColorPicker
                label="Kolon arka plan rengi"
                value={field.value}
                onChange={field.onChange}
                presets={LIGHT_PRESET_COLORS}
              />
            )}
          />
          {errors.columnColor ? (
            <p className="-mt-2 text-xs text-red-600">{errors.columnColor.message}</p>
          ) : null}

          <Controller
            control={control}
            name="badgeColor"
            render={({ field }) => (
              <ColorPicker
                label="Vurgu / nokta rengi"
                value={field.value}
                onChange={field.onChange}
                presets={ACCENT_PRESET_COLORS}
              />
            )}
          />
          {errors.badgeColor ? (
            <p className="-mt-2 text-xs text-red-600">{errors.badgeColor.message}</p>
          ) : null}

          <label className="flex items-center gap-2 text-[13px] text-slate-600">
            <input type="checkbox" {...register("isCompletedProcess")} className="h-4 w-4 rounded" />
            Bu bir &quot;tamamlandı&quot; süreci
          </label>

          <div
            className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2.5"
            style={{ backgroundColor: columnColor }}
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: badgeColor }} />
            <span className="text-[13px] font-medium text-slate-700">Önizleme</span>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 transition hover:bg-slate-100"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
            >
              {process ? "Kaydet" : "Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
