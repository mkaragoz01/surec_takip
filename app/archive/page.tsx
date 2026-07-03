import { prisma } from "@/lib/prisma";
import { archiveExpiredCompletedTasks } from "@/lib/archive";
import { toProcessDTO, toTaskDTO } from "@/lib/dto";
import { ArchiveList } from "@/components/archive-list";
import type { ArchivedTaskDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  await archiveExpiredCompletedTasks();

  const [archivedTasks, processes] = await Promise.all([
    prisma.task.findMany({
      where: { archivedAt: { not: null } },
      orderBy: { archivedAt: "desc" },
      include: { process: true },
    }),
    prisma.process.findMany({ orderBy: { order: "asc" } }),
  ]);

  const processDTOs = processes.map(toProcessDTO);

  const archivedDTOs: ArchivedTaskDTO[] = archivedTasks.map((t) => ({
    ...toTaskDTO(t),
    processName: t.process.name,
  }));

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
      <h2 className="mb-1 text-base font-semibold text-slate-800">Arşiv</h2>
      <p className="mb-5 text-[13px] text-slate-400">
        Tamamlanan ve süresi dolan kartlar burada saklanır. Silinmezler, istediğiniz zaman geri
        yükleyebilirsiniz.
      </p>
      <ArchiveList tasks={archivedDTOs} processes={processDTOs} />
    </div>
  );
}
