import { prisma } from "@/lib/prisma";
import { ensureDefaultData } from "@/lib/seed";
import { archiveExpiredCompletedTasks } from "@/lib/archive";
import { toProcessDTO, toTaskDTO } from "@/lib/dto";
import { KanbanBoard } from "@/components/kanban-board";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureDefaultData();
  await archiveExpiredCompletedTasks();

  const [processes, tasks] = await Promise.all([
    prisma.process.findMany({ orderBy: { order: "asc" } }),
    prisma.task.findMany({ where: { archivedAt: null }, orderBy: { order: "asc" } }),
  ]);

  const processDTOs = processes.map(toProcessDTO);
  const taskDTOs = tasks.map(toTaskDTO);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-5 sm:px-6">
      <KanbanBoard initialProcesses={processDTOs} initialTasks={taskDTOs} />
    </div>
  );
}
