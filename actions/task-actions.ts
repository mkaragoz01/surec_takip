"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { taskFormSchema, type TaskFormValues } from "@/lib/validations";

function normalizeDescription(description?: string) {
  return description && description.trim().length > 0 ? description.trim() : null;
}

async function computeCompletionFields(processId: string, previousCompletedAt: Date | null) {
  const process = await prisma.process.findUniqueOrThrow({ where: { id: processId } });
  const settings = await prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  if (process.isCompletedProcess && !previousCompletedAt) {
    const now = new Date();
    const archiveAt = new Date(now.getTime() + settings.completedTaskRetentionDays * 24 * 60 * 60 * 1000);
    return { completedAt: now, archiveAt, archivedAt: null as Date | null };
  }

  if (!process.isCompletedProcess && previousCompletedAt) {
    return { completedAt: null, archiveAt: null, archivedAt: null as Date | null };
  }

  return null;
}

export async function createTask(values: TaskFormValues) {
  const data = taskFormSchema.parse(values);
  const maxOrder = await prisma.task.aggregate({
    _max: { order: true },
    where: { processId: data.processId },
  });

  const completion = await computeCompletionFields(data.processId, null);

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: normalizeDescription(data.description),
      priority: data.priority,
      processId: data.processId,
      order: (maxOrder._max.order ?? -1) + 1,
      ...(completion ?? {}),
    },
  });

  revalidatePath("/");
  return task;
}

export async function updateTask(id: string, values: TaskFormValues) {
  const data = taskFormSchema.parse(values);
  const existing = await prisma.task.findUniqueOrThrow({ where: { id } });

  let extra: { completedAt: Date | null; archiveAt: Date | null; archivedAt: Date | null } | null = null;
  let order = existing.order;

  if (existing.processId !== data.processId) {
    extra = await computeCompletionFields(data.processId, existing.completedAt);
    const maxOrder = await prisma.task.aggregate({
      _max: { order: true },
      where: { processId: data.processId },
    });
    order = (maxOrder._max.order ?? -1) + 1;
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      description: normalizeDescription(data.description),
      priority: data.priority,
      processId: data.processId,
      order,
      ...(extra ?? {}),
    },
  });

  revalidatePath("/");
  return task;
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
}

type MoveTaskInput = {
  taskId: string;
  destinationProcessId: string;
  sourceOrderedIds?: string[];
  destinationOrderedIds: string[];
};

export async function moveTask(input: MoveTaskInput) {
  const { taskId, destinationProcessId, sourceOrderedIds, destinationOrderedIds } = input;
  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  const changingProcess = task.processId !== destinationProcessId;

  const extra = changingProcess
    ? await computeCompletionFields(destinationProcessId, task.completedAt)
    : null;

  await prisma.$transaction(async (tx) => {
    for (let index = 0; index < destinationOrderedIds.length; index += 1) {
      const id = destinationOrderedIds[index];
      await tx.task.update({
        where: { id },
        data:
          id === taskId
            ? { order: index, processId: destinationProcessId, ...(extra ?? {}) }
            : { order: index },
      });
    }

    if (changingProcess && sourceOrderedIds) {
      for (let index = 0; index < sourceOrderedIds.length; index += 1) {
        await tx.task.update({
          where: { id: sourceOrderedIds[index] },
          data: { order: index },
        });
      }
    }
  });

  revalidatePath("/");
}

export async function restoreTask(id: string, processId?: string) {
  let targetProcessId = processId;

  if (!targetProcessId) {
    const fallback = await prisma.process.findFirst({
      where: { isCompletedProcess: false },
      orderBy: { order: "asc" },
    });
    targetProcessId = fallback?.id;
  }

  if (!targetProcessId) {
    throw new Error("Geri yüklemek için bir süreç bulunamadı");
  }

  const maxOrder = await prisma.task.aggregate({
    _max: { order: true },
    where: { processId: targetProcessId },
  });

  const task = await prisma.task.update({
    where: { id },
    data: {
      processId: targetProcessId,
      order: (maxOrder._max.order ?? -1) + 1,
      completedAt: null,
      archiveAt: null,
      archivedAt: null,
    },
  });

  revalidatePath("/");
  revalidatePath("/archive");
  return task;
}
