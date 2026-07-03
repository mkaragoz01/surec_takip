export type Priority = "LOW" | "NORMAL" | "HIGH";

export type ProcessDTO = {
  id: string;
  name: string;
  columnColor: string;
  badgeColor: string;
  order: number;
  isCompletedProcess: boolean;
};

export type TaskDTO = {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  order: number;
  processId: string;
  completedAt: string | null;
  archiveAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ArchivedTaskDTO = TaskDTO & {
  processName: string;
};
