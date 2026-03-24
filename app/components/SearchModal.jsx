"use client";
import { useState, useEffect, useRef } from "react";

const statusLabels = {
  todo: { label: "To Do", color: "text-blue-600 dark:text-blue-400" },
  backlog: { label: "Backlog", color: "text-zinc-600 dark:text-zinc-400" },
  inprogress: { label: "In Progress", color: "text-amber-600 dark:text-amber-400" },
  done: { label: "Done", color: "text-emerald-600 dark:text-emerald-400" },
  completed: { label: "Completed", color: "text-purple-600 dark:text-purple-400" },
};

const priorityDots = {
  low: "bg-blue-400",
  medium: "bg-yellow-400",
  high: "bg-red-400",
};

export default function SearchModal({ isOpen, onClose, tasks, onView }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-700/60 px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 shrink-0">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
            className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          <kbd className="hidden sm:flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto">
          {query.trim() && filtered.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                No tasks found for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {filtered.map((task) => {
            const status = statusLabels[task.status] || statusLabels.todo;
            return (
              <button
                key={task._id}
                onClick={() => {
                  onClose();
                  onView(task);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${priorityDots[task.priority]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-medium ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 capitalize">
                    {task.period}
                  </span>
                </div>
              </button>
            );
          })}

          {!query.trim() && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                Type to search across all tasks
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
