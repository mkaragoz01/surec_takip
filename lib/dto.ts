import type { Process, Task } from "@prisma/client";
import type { ProcessDTO, TaskDTO } from "@/lib/types";

export function toProcessDTO(process: Process): ProcessDTO {
  return {
    id: process.id,
    name: process.name,
    columnColor: process.columnColor,
    badgeColor: process.badgeColor,
    order: process.order,
    isCompletedProcess: process.isCompletedProcess,
  };
}

export function toTaskDTO(task: Task): TaskDTO {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    order: task.order,
    processId: task.processId,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    archiveAt: task.archiveAt ? task.archiveAt.toISOString() : null,
    archivedAt: task.archivedAt ? task.archivedAt.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
