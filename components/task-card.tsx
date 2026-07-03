"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlignLeft, FileText, Pencil, Trash2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { TaskDTO } from "@/lib/types";

const PRIORITY_ICON_BG: Record<TaskDTO["priority"], string> = {
  LOW: "bg-slate-100",
  NORMAL: "bg-blue-50",
  HIGH: "bg-rose-50",
};

const PRIORITY_ICON_COLOR: Record<TaskDTO["priority"], string> = {
  LOW: "text-slate-400",
  NORMAL: "text-blue-500",
  HIGH: "text-rose-500",
};

const PRIORITY_DOT: Record<TaskDTO["priority"], string> = {
  LOW: "bg-slate-300",
  NORMAL: "bg-blue-400",
  HIGH: "bg-rose-400",
};

const PRIORITY_LABELS: Record<TaskDTO["priority"], string> = {
  LOW: "Düşük",
  NORMAL: "Normal",
  HIGH: "Yüksek",
};

type TaskCardViewProps = {
  task: TaskDTO;
  onEdit?: () => void;
  onDelete?: () => void;
  overlay?: boolean;
};

export function TaskCardView({ task, onEdit, onDelete, overlay }: TaskCardViewProps) {
  return (
    <div
      className={cn(
        "group flex items-start gap-2.5 rounded-xl border bg-white p-2.5 transition-all duration-150 ease-out",
        overlay
          ? "cursor-hand-grabbing rotate-2 border-slate-200 shadow-[0_16px_32px_-8px_rgba(15,23,42,0.25)]"
          : "cursor-hand-grab border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_8px_16px_-4px_rgba(15,23,42,0.1)] active:cursor-hand-grabbing"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
          PRIORITY_ICON_BG[task.priority]
        )}
      >
        <FileText size={13} className={PRIORITY_ICON_COLOR[task.priority]} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[13px] font-medium leading-snug text-slate-700">{task.title}</h4>
          {onEdit && onDelete ? (
            <div className="flex shrink-0 gap-0.5 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Düzenle"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
                className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Sil"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ) : null}
        </div>

        {task.description ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">{task.description}</p>
        ) : null}

        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOT[task.priority])} />
            {PRIORITY_LABELS[task.priority]}
          </span>
          {task.description ? <AlignLeft size={12} className="text-slate-300" /> : null}
          {task.completedAt ? <span className="ml-auto">{formatDate(task.completedAt)}</span> : null}
        </div>
      </div>
    </div>
  );
}

type TaskCardProps = {
  task: TaskDTO;
  onEdit: () => void;
  onDelete: () => void;
  dimmed?: boolean;
};

export function TaskCard({ task, onEdit, onDelete, dimmed }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "Task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : dimmed ? 0.25 : 1,
    pointerEvents: dimmed ? ("none" as const) : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onEdit}>
      <TaskCardView task={task} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}
