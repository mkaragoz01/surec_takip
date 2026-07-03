"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArchiveRestore } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { restoreTask } from "@/actions/task-actions";
import type { ArchivedTaskDTO, ProcessDTO } from "@/lib/types";

type ArchiveListProps = {
  tasks: ArchivedTaskDTO[];
  processes: ProcessDTO[];
};

export function ArchiveList({ tasks, processes }: ArchiveListProps) {
  const router = useRouter();
  const defaultProcessId = processes.find((p) => !p.isCompletedProcess)?.id ?? processes[0]?.id ?? "";
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [restoringId, setRestoringId] = useState<string | null>(null);

  async function handleRestore(taskId: string) {
    setRestoringId(taskId);
    try {
      await restoreTask(taskId, selections[taskId] ?? defaultProcessId);
      router.refresh();
    } finally {
      setRestoringId(null);
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
        Henüz arşivlenmiş kart yok.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
      <table className="w-full text-left text-[13px]">
        <thead className="text-xs text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Başlık</th>
            <th className="px-4 py-3 font-medium">Eski Süreç</th>
            <th className="px-4 py-3 font-medium">Tamamlanma</th>
            <th className="px-4 py-3 font-medium">Arşivlenme</th>
            <th className="px-4 py-3 font-medium">Geri Yükle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <tr key={task.id} className="transition hover:bg-slate-50/60">
              <td className="px-4 py-3 font-medium text-slate-700">{task.title}</td>
              <td className="px-4 py-3 text-slate-500">{task.processName}</td>
              <td className="px-4 py-3 text-slate-500">{formatDate(task.completedAt)}</td>
              <td className="px-4 py-3 text-slate-500">{formatDate(task.archivedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <select
                    value={selections[task.id] ?? defaultProcessId}
                    onChange={(event) =>
                      setSelections((prev) => ({ ...prev, [task.id]: event.target.value }))
                    }
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                  >
                    {processes.map((process) => (
                      <option key={process.id} value={process.id}>
                        {process.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRestore(task.id)}
                    disabled={restoringId === task.id}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50 disabled:opacity-60"
                  >
                    <ArchiveRestore size={13} /> Geri Yükle
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
