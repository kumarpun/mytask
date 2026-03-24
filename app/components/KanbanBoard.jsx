"use client";
import { useState } from "react";
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

export default function KanbanBoard({ tasks, onUpdateTask, onDeleteTask, onEditTask }) {
  const [dragOverColumn, setDragOverColumn] = useState(null);

  function handleDragOver(e, columnId) {
    e.preventDefault();
    setDragOverColumn(columnId);
  }

  function handleDragLeave() {
    setDragOverColumn(null);
  }

  function handleDrop(e, columnId) {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onUpdateTask(taskId, { status: columnId });
    }
  }

  return (
    <div className="grid grid-cols-1 gap-7for  sm:grid-cols-2 lg:grid-cols-3">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        const isOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
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
                columnTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onDelete={onDeleteTask}
                    onEdit={onEditTask}
                    onUpdate={onUpdateTask}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
