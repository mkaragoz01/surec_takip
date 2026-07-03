import { prisma } from "@/lib/prisma";
import { toProcessDTO, toTaskDTO } from "@/lib/dto";
import type { ImportFile } from "@/lib/validations";

export const EXPORT_VERSION = 1;

export async function buildExportData() {
  const [settings, processes, tasks] = await Promise.all([
    prisma.setting.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    }),
    prisma.process.findMany({ orderBy: { order: "asc" } }),
    prisma.task.findMany({ orderBy: { order: "asc" } }),
  ]);

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    settings: {
      completedTaskRetentionDays: settings.completedTaskRetentionDays,
    },
    processes: processes.map(toProcessDTO),
    tasks: tasks.map(toTaskDTO),
  };
}

export async function applyImportData(data: ImportFile) {
  await prisma.$transaction(async (tx) => {
    await tx.task.deleteMany();
    await tx.process.deleteMany();

    await tx.process.createMany({
      data: data.processes.map((process) => ({
        id: process.id,
        name: process.name,
        columnColor: process.columnColor,
        badgeColor: process.badgeColor,
        order: process.order,
        isCompletedProcess: process.isCompletedProcess,
      })),
    });

    await tx.task.createMany({
      data: data.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        order: task.order,
        processId: task.processId,
        completedAt: task.completedAt ? new Date(task.completedAt) : null,
        archiveAt: task.archiveAt ? new Date(task.archiveAt) : null,
        archivedAt: task.archivedAt ? new Date(task.archivedAt) : null,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      })),
    });

    await tx.setting.upsert({
      where: { id: "default" },
      update: { completedTaskRetentionDays: data.settings.completedTaskRetentionDays },
      create: {
        id: "default",
        completedTaskRetentionDays: data.settings.completedTaskRetentionDays,
      },
    });
  });
}
