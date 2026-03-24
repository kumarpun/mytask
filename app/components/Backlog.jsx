"use client";
import { useState } from "react";
import TaskCard from "./TaskCard";

export default function Backlog({ tasks, onMoveToTodo, onDelete, onEdit, onUpdate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 overflow-hidden transition-all">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${expanded ? "rotate-0" : "-rotate-90"}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            Backlog
          </h3>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-200/80 px-1.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-700/80 dark:text-zinc-400">
            {tasks.length}
          </span>
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {expanded ? "Click to collapse" : "Click to expand"}
        </span>
      </button>

      {/* Expandable body */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-3">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700/50 p-6">
              <p className="text-xs text-zinc-400 dark:text-zinc-600">
                No backlog tasks
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {tasks.map((task) => (
                <div key={task._id} className="flex flex-col gap-2 min-h-[140px]">
                  <TaskCard
                    task={task}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onUpdate={onUpdate}
                  />
                  <button
                    onClick={() => onMoveToTodo(task._id)}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                    Move to To Do
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
