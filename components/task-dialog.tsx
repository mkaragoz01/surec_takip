"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { taskFormSchema, type TaskFormValues } from "@/lib/validations";
import type { ProcessDTO, TaskDTO } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-700 transition focus:border-slate-300 focus:bg-white focus:outline-none";
const labelClass = "mb-1.5 block text-[13px] font-medium text-slate-600";

type TaskDialogProps = {
  open: boolean;
  processes: ProcessDTO[];
  task?: TaskDTO | null;
  defaultProcessId?: string;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
};

export function TaskDialog({ open, processes, task, defaultProcessId, onClose, onSubmit }: TaskDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "NORMAL",
      processId: defaultProcessId ?? processes[0]?.id ?? "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "NORMAL",
      processId: task?.processId ?? defaultProcessId ?? processes[0]?.id ?? "",
    });
  }, [open, task, defaultProcessId, processes, reset]);

  if (!open) return null;

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    onClose();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl shadow-slate-900/10">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-800">
            {task ? "Kartı Düzenle" : "Yeni Kart"}
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

        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label className={labelClass}>Başlık</label>
            <input {...register("title")} className={inputClass} placeholder="Kart başlığı" autoFocus />
            {errors.title ? <p className="mt-1 text-xs text-red-600">{errors.title.message}</p> : null}
          </div>

          <div>
            <label className={labelClass}>Açıklama</label>
            <textarea
              {...register("description")}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Kısa açıklama (opsiyonel)"
            />
            {errors.description ? (
              <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Öncelik</label>
              <select {...register("priority")} className={inputClass}>
                <option value="LOW">Düşük</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">Yüksek</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Süreç</label>
              <select {...register("processId")} className={inputClass}>
                {processes.map((process) => (
                  <option key={process.id} value={process.id}>
                    {process.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              {task ? "Kaydet" : "Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
