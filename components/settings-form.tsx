"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { settingsFormSchema, type SettingsFormValues } from "@/lib/validations";
import { updateSettings } from "@/actions/settings-actions";

type SettingsFormProps = {
  initialRetentionDays: number;
};

export function SettingsForm({ initialRetentionDays }: SettingsFormProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: { completedTaskRetentionDays: initialRetentionDays },
  });

  useEffect(() => {
    reset({ completedTaskRetentionDays: initialRetentionDays });
  }, [initialRetentionDays, reset]);

  const submit = handleSubmit(async (values) => {
    await updateSettings(values);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  });

  return (
    <form onSubmit={submit} className="max-w-sm space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5">
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
          Tamamlanan kartlar kaç gün sonra arşivlensin?
        </label>
        <input
          type="number"
          min={1}
          max={365}
          {...register("completedTaskRetentionDays", { valueAsNumber: true })}
          className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm transition focus:border-slate-300 focus:bg-white focus:outline-none"
        />
        <p className="mt-1.5 text-xs text-slate-400">Varsayılan: 3 gün · Aralık: 1-365 gün</p>
        {errors.completedTaskRetentionDays ? (
          <p className="mt-1 text-xs text-red-600">{errors.completedTaskRetentionDays.message}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
        >
          Kaydet
        </button>
        {saved ? <span className="text-xs font-medium text-emerald-600">Kaydedildi</span> : null}
      </div>
    </form>
  );
}
