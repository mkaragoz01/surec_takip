"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { KanbanColumn, type ColumnState } from "@/components/kanban-column";
import { TaskCardView } from "@/components/task-card";
import { TaskDialog } from "@/components/task-dialog";
import { ProcessDialog } from "@/components/process-dialog";
import { SearchFilter } from "@/components/search-filter";
import { createTask, updateTask, deleteTask, moveTask } from "@/actions/task-actions";
import { createProcess, updateProcess, deleteProcess, reorderProcesses } from "@/actions/process-actions";
import type { ProcessDTO, TaskDTO, Priority } from "@/lib/types";
import type { TaskFormValues, ProcessFormValues } from "@/lib/validations";

type KanbanBoardProps = {
  initialProcesses: ProcessDTO[];
  initialTasks: TaskDTO[];
};

function buildColumns(processes: ProcessDTO[], tasks: TaskDTO[]): ColumnState[] {
  return [...processes]
    .sort((a, b) => a.order - b.order)
    .map((process) => ({
      ...process,
      tasks: tasks
        .filter((task) => task.processId === process.id)
        .sort((a, b) => a.order - b.order),
    }));
}

export function KanbanBoard({ initialProcesses, initialTasks }: KanbanBoardProps) {
  const router = useRouter();
  const [columns, setColumns] = useState<ColumnState[]>(() => buildColumns(initialProcesses, initialTasks));
  const [prevInitialProcesses, setPrevInitialProcesses] = useState(initialProcesses);
  const [prevInitialTasks, setPrevInitialTasks] = useState(initialTasks);

  if (initialProcesses !== prevInitialProcesses || initialTasks !== prevInitialTasks) {
    setPrevInitialProcesses(initialProcesses);
    setPrevInitialTasks(initialTasks);
    setColumns(buildColumns(initialProcesses, initialTasks));
  }

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "ALL">("ALL");

  const [taskDialog, setTaskDialog] = useState<{ open: boolean; task: TaskDTO | null; processId?: string }>({
    open: false,
    task: null,
  });
  const [processDialog, setProcessDialog] = useState<{ open: boolean; process: ProcessDTO | null }>({
    open: false,
    process: null,
  });

  const dragStartColumnId = useRef<string | null>(null);
  const [activeTask, setActiveTask] = useState<TaskDTO | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnState | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function setGlobalDragCursor(active: boolean) {
    document.body.classList.toggle("is-dragging-hand", active);
  }

  function handleDragStart(event: DragStartEvent) {
    const type = event.active.data.current?.type;
    setGlobalDragCursor(true);
    if (type === "Task") {
      const columnId = columns.find((c) => c.tasks.some((t) => t.id === event.active.id))?.id ?? null;
      dragStartColumnId.current = columnId;
      setActiveTask(event.active.data.current?.task as TaskDTO);
    } else if (type === "Column") {
      const processId = event.active.data.current?.processId as string | undefined;
      setActiveColumn(columns.find((c) => c.id === processId) ?? null);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    if (active.data.current?.type !== "Task") return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    setColumns((prev) => {
      const activeColIndex = prev.findIndex((c) => c.tasks.some((t) => t.id === activeId));
      if (activeColIndex === -1) return prev;
      const activeTaskIndex = prev[activeColIndex].tasks.findIndex((t) => t.id === activeId);

      let overColIndex = -1;
      let overTaskIndex = -1;
      const overType = over.data.current?.type;

      if (overType === "Task") {
        overColIndex = prev.findIndex((c) => c.tasks.some((t) => t.id === overId));
        overTaskIndex = overColIndex === -1 ? -1 : prev[overColIndex].tasks.findIndex((t) => t.id === overId);
      } else if (overType === "ColumnBody" || overType === "Column") {
        const processId = over.data.current?.processId as string | undefined;
        overColIndex = prev.findIndex((c) => c.id === processId);
        overTaskIndex = overColIndex === -1 ? -1 : prev[overColIndex].tasks.length;
      }

      if (overColIndex === -1) return prev;

      if (activeColIndex === overColIndex) {
        if (activeTaskIndex === overTaskIndex || overTaskIndex === -1) return prev;
        const newTasks = arrayMove(prev[activeColIndex].tasks, activeTaskIndex, overTaskIndex);
        const next = [...prev];
        next[activeColIndex] = { ...next[activeColIndex], tasks: newTasks };
        return next;
      }

      const next = [...prev];
      const sourceTasks = [...next[activeColIndex].tasks];
      const [movedTask] = sourceTasks.splice(activeTaskIndex, 1);
      const destTasks = [...next[overColIndex].tasks];
      destTasks.splice(overTaskIndex, 0, { ...movedTask, processId: next[overColIndex].id });
      next[activeColIndex] = { ...next[activeColIndex], tasks: sourceTasks };
      next[overColIndex] = { ...next[overColIndex], tasks: destTasks };
      return next;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const activeType = active.data.current?.type;
    setActiveTask(null);
    setActiveColumn(null);
    setGlobalDragCursor(false);

    if (!over) {
      dragStartColumnId.current = null;
      return;
    }

    if (activeType === "Column") {
      const activeColId = active.data.current?.processId as string | undefined;
      const overColId =
        (over.data.current?.processId as string | undefined) ?? String(over.id).replace("col:", "");

      if (activeColId && overColId && activeColId !== overColId) {
        const oldIndex = columns.findIndex((c) => c.id === activeColId);
        const newIndex = columns.findIndex((c) => c.id === overColId);
        if (oldIndex === -1 || newIndex === -1) return;
        const reordered = arrayMove(columns, oldIndex, newIndex);
        setColumns(reordered);
        void reorderProcesses(reordered.map((c) => c.id)).then(() => router.refresh());
      }
      return;
    }

    if (activeType === "Task") {
      const taskId = String(active.id);
      const sourceColId = dragStartColumnId.current;
      dragStartColumnId.current = null;

      const destCol = columns.find((c) => c.tasks.some((t) => t.id === taskId));
      if (!destCol) return;

      const destinationOrderedIds = destCol.tasks.map((t) => t.id);
      const changingColumn = Boolean(sourceColId && sourceColId !== destCol.id);
      const sourceOrderedIds = changingColumn
        ? columns.find((c) => c.id === sourceColId)?.tasks.map((t) => t.id)
        : undefined;

      void moveTask({
        taskId,
        destinationProcessId: destCol.id,
        sourceOrderedIds,
        destinationOrderedIds,
      }).then(() => router.refresh());
    }
  }

  function matchesFilters(task: TaskDTO) {
    const matchesSearch =
      search.trim().length === 0 ||
      task.title.toLowerCase().includes(search.trim().toLowerCase()) ||
      (task.description ?? "").toLowerCase().includes(search.trim().toLowerCase());
    const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  }

  async function handleTaskSubmit(values: TaskFormValues) {
    if (taskDialog.task) {
      await updateTask(taskDialog.task.id, values);
    } else {
      await createTask(values);
    }
    router.refresh();
  }

  async function handleDeleteTask(task: TaskDTO) {
    if (!window.confirm(`"${task.title}" kartını silmek istediğinize emin misiniz?`)) return;
    setColumns((prev) =>
      prev.map((c) => ({ ...c, tasks: c.tasks.filter((t) => t.id !== task.id) }))
    );
    await deleteTask(task.id);
    router.refresh();
  }

  async function handleProcessSubmit(values: ProcessFormValues) {
    if (processDialog.process) {
      await updateProcess(processDialog.process.id, values);
    } else {
      await createProcess(values);
    }
    router.refresh();
  }

  async function handleDeleteProcess(process: ProcessDTO) {
    const taskCount = columns.find((c) => c.id === process.id)?.tasks.length ?? 0;
    const message =
      taskCount > 0
        ? `"${process.name}" sürecini silmek, içindeki ${taskCount} kartı da silecek. Emin misiniz?`
        : `"${process.name}" sürecini silmek istediğinize emin misiniz?`;
    if (!window.confirm(message)) return;
    setColumns((prev) => prev.filter((c) => c.id !== process.id));
    await deleteProcess(process.id);
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          priority={priorityFilter}
          onPriorityChange={setPriorityFilter}
        />
        <button
          type="button"
          onClick={() => setProcessDialog({ open: true, process: null })}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-[13px] font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={15} /> Yeni Süreç
        </button>
      </div>

      <DndContext
        id="kanban-dnd-context"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setActiveTask(null);
          setActiveColumn(null);
          setGlobalDragCursor(false);
        }}
      >
        <div className="no-scrollbar flex flex-1 items-start gap-3 overflow-x-auto pb-2">
          <SortableContext items={columns.map((c) => `col:${c.id}`)} strategy={horizontalListSortingStrategy}>
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onAddTask={(processId) => setTaskDialog({ open: true, task: null, processId })}
                onEditTask={(task) => setTaskDialog({ open: true, task })}
                onDeleteTask={handleDeleteTask}
                onEditProcess={(process) => setProcessDialog({ open: true, process })}
                onDeleteProcess={handleDeleteProcess}
                isTaskVisible={matchesFilters}
                isBoardDragging={Boolean(activeTask || activeColumn)}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
          {activeTask ? (
            <div className="w-64">
              <TaskCardView task={activeTask} overlay />
            </div>
          ) : null}
          {activeColumn ? (
            <div
              className="cursor-hand-grabbing flex w-64 rotate-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 py-3 shadow-[0_20px_40px_-12px_rgba(15,23,42,0.3)]"
              style={{ backgroundColor: activeColumn.columnColor }}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: activeColumn.badgeColor }} />
              <span className="text-[13px] font-semibold text-slate-700">{activeColumn.name}</span>
              <span className="text-[13px] text-slate-400">{activeColumn.tasks.length}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        open={taskDialog.open}
        processes={columns}
        task={taskDialog.task}
        defaultProcessId={taskDialog.processId}
        onClose={() => setTaskDialog({ open: false, task: null })}
        onSubmit={handleTaskSubmit}
      />

      <ProcessDialog
        open={processDialog.open}
        process={processDialog.process}
        onClose={() => setProcessDialog({ open: false, process: null })}
        onSubmit={handleProcessSubmit}
      />
    </div>
  );
}
