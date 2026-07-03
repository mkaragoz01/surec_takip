"use client";

import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { TaskCard } from "@/components/task-card";
import { cn } from "@/lib/utils";
import type { ProcessDTO, TaskDTO } from "@/lib/types";

export type ColumnState = ProcessDTO & { tasks: TaskDTO[] };

type KanbanColumnProps = {
  column: ColumnState;
  onAddTask: (processId: string) => void;
  onEditTask: (task: TaskDTO) => void;
  onDeleteTask: (task: TaskDTO) => void;
  onEditProcess: (process: ProcessDTO) => void;
  onDeleteProcess: (process: ProcessDTO) => void;
  isTaskVisible?: (task: TaskDTO) => boolean;
  isBoardDragging?: boolean;
};

export function KanbanColumn({
  column,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onEditProcess,
  onDeleteProcess,
  isTaskVisible,
  isBoardDragging,
}: KanbanColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setColumnNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `col:${column.id}`,
    data: { type: "Column", processId: column.id },
  });

  const { setNodeRef: setBodyNodeRef } = useDroppable({
    id: `colbody:${column.id}`,
    data: { type: "ColumnBody", processId: column.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setColumnNodeRef}
      style={{ ...style, backgroundColor: column.columnColor }}
      className={cn(
        "group/col flex w-64 shrink-0 flex-col rounded-2xl border p-2.5 transition-shadow",
        isDragging ? "border-dashed border-slate-300" : "border-black/[0.04]"
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-2 px-1 py-1">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-hand-grab -ml-1 touch-none rounded p-1 text-transparent group-hover/col:text-slate-300 hover:!bg-black/5 hover:!text-slate-500 active:cursor-hand-grabbing"
            aria-label="Süreci taşı"
          >
            <GripVertical size={13} />
          </button>
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: column.badgeColor }} />
          <span className="truncate text-[13px] font-semibold text-slate-700">{column.name}</span>
          <span className="shrink-0 text-[13px] text-slate-400">{column.tasks.length}</span>
        </div>
        <div className="flex shrink-0 gap-0.5 opacity-0 transition group-hover/col:opacity-100">
          <button
            type="button"
            onClick={() => onEditProcess(column)}
            className="rounded p-1 text-slate-400 hover:bg-black/5 hover:text-slate-700"
            aria-label="Süreci düzenle"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDeleteProcess(column)}
            className="rounded p-1 text-slate-400 hover:bg-red-100 hover:text-red-600"
            aria-label="Süreci sil"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div
        ref={setBodyNodeRef}
        className={cn(
          "flex flex-col gap-2 px-0.5 pb-1 pt-1 transition-[min-height] duration-150",
          isBoardDragging ? "min-h-[110px]" : "min-h-[8px]"
        )}
      >
        <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task)}
              dimmed={isTaskVisible ? !isTaskVisible(task) : false}
            />
          ))}
        </SortableContext>
      </div>

      <button
        type="button"
        onClick={() => onAddTask(column.id)}
        className="mt-1 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-slate-400 transition hover:bg-black/[0.03] hover:text-slate-600"
      >
        <Plus size={14} /> Yeni kart
      </button>
    </div>
  );
}
