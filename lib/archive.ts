import { prisma } from "@/lib/prisma";

export async function archiveExpiredCompletedTasks() {
  const now = new Date();
  await prisma.task.updateMany({
    where: {
      archivedAt: null,
      archiveAt: { lte: now },
    },
    data: { archivedAt: now },
  });
}
