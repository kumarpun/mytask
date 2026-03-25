"use client";
import { useState, useRef, useCallback } from "react";
import TaskCard from "./TaskCard";

const COLUMNS = [
  {
    id: "todo",
    label: "To Do",
    headerColor: "text-blue-600 dark:text-blue-400",
    dotColor: "bg-blue-400",
  },
  {
    id: "inprogress",
    label: "In Progress",
    headerColor: "text-amber-600 dark:text-amber-400",
    dotColor: "bg-amber-400",
  },
  {
    id: "done",
    label: "Done",
    headerColor: "text-emerald-600 dark:text-emerald-400",
    dotColor: "bg-emerald-400",
  },
];

export default function KanbanBoard({ tasks, onUpdateTask, onDeleteTask, onEditTask, onReorder, currentPeriod }) {
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const dragSourceRef = useRef(null);
  const dropIndexRef = useRef(null);

  function handleDragStart(taskId, status) {
    dragSourceRef.current = { taskId, status };
  }

  function handleDragOver(e, columnId) {
    e.preventDefault();
    setDragOverColumn(columnId);
  }

  function handleDragLeave(e, columnId) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (dragOverColumn === columnId) {
        setDragOverColumn(null);
        setDropTargetIndex(null);
        dropIndexRef.current = null;
      }
    }
  }

  const handleTaskDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const insertIndex = e.clientY < midY ? index : index + 1;
    dropIndexRef.current = insertIndex;
    setDropTargetIndex(insertIndex);
  }, []);

  function handleDrop(e, columnId, columnTasks) {
    e.preventDefault();

    const source = dragSourceRef.current;
    const targetIndex = dropIndexRef.current;

    // Reset all state
    setDragOverColumn(null);
    setDropTargetIndex(null);
    dragSourceRef.current = null;
    dropIndexRef.current = null;

    if (!source) return;

    const { taskId, status: sourceStatus } = source;

    if (sourceStatus === columnId && targetIndex !== null) {
      // Reorder within same column
      const orderedIds = columnTasks.map((t) => t._id);
      const fromIndex = orderedIds.indexOf(taskId);
      if (fromIndex === -1) return;
      if (fromIndex === targetIndex || fromIndex === targetIndex - 1) return; // no change

      orderedIds.splice(fromIndex, 1);
      const insertAt = targetIndex > fromIndex ? targetIndex - 1 : targetIndex;
      orderedIds.splice(insertAt, 0, taskId);

      if (onReorder) {
        onReorder(orderedIds, columnId, currentPeriod);
      }
    } else if (sourceStatus !== columnId) {
      // Move to different column
      onUpdateTask(taskId, { status: columnId });
    }
  }

  function handleDragEnd() {
    dragSourceRef.current = null;
    dropIndexRef.current = null;
    setDragOverColumn(null);
    setDropTargetIndex(null);
  }

  return (
    <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {COLUMNS.map((column) => {
        const columnTasks = tasks
          .filter((t) => t.status === column.id)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const isOver = dragOverColumn === column.id;
        const isSameColumn = dragSourceRef.current?.status === column.id;

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={(e) => handleDragLeave(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id, columnTasks)}
            className={`flex flex-col rounded-2xl border p-3 min-h-[500px] transition-colors ${
              isOver
                ? "border-indigo-400 bg-indigo-50/50 dark:border-indigo-500/50 dark:bg-indigo-950/20"
                : "border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50"
            }`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-1 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${column.dotColor}`}
                />
                <h3
                  className={`text-sm font-semibold ${column.headerColor}`}
                >
                  {column.label}
                </h3>
              </div>
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-200/80 px-1.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-700/80 dark:text-zinc-400">
                {columnTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="flex flex-1 flex-col gap-2.5">
              {columnTasks.length === 0 ? (
                <div
                  className={`flex flex-1 items-center justify-center rounded-xl border-2 border-dashed p-4 transition-colors ${
                    isOver
                      ? "border-indigo-300 dark:border-indigo-600"
                      : "border-zinc-200 dark:border-zinc-700/50"
                  }`}
                >
                  <p className="text-xs text-zinc-400 dark:text-zinc-600">
                    {isOver ? "Drop here" : "No tasks"}
                  </p>
                </div>
              ) : (
                columnTasks.map((task, index) => (
                  <div
                    key={task._id}
                    onDragOver={(e) => handleTaskDragOver(e, index)}
                    className="relative"
                  >
                    {/* Drop indicator line - before this task */}
                    {isOver && isSameColumn && dropTargetIndex === index && (
                      <div className="absolute -top-1.5 left-2 right-2 h-0.5 rounded-full bg-indigo-500 z-10">
                        <div className="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-indigo-500" />
                      </div>
                    )}
                    <TaskCard
                      task={task}
                      onDelete={onDeleteTask}
                      onEdit={onEditTask}
                      onUpdate={onUpdateTask}
                      onDragStart={() => handleDragStart(task._id, column.id)}
                      onDragEnd={handleDragEnd}
                    />
                    {/* Drop indicator line - after last task */}
                    {isOver && isSameColumn && dropTargetIndex === index + 1 && index === columnTasks.length - 1 && (
                      <div className="absolute -bottom-1.5 left-2 right-2 h-0.5 rounded-full bg-indigo-500 z-10">
                        <div className="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-indigo-500" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
