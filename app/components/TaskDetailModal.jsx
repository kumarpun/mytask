"use client";
import { useState } from "react";

const priorityColors = {
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const priorityDots = {
  low: "bg-blue-400",
  medium: "bg-yellow-400",
  high: "bg-red-400",
};

const allStatuses = [
  { id: "todo", label: "To Do", dot: "bg-blue-400", active: "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300" },
  { id: "backlog", label: "Backlog", dot: "bg-zinc-400", active: "border-zinc-500 bg-zinc-100 text-zinc-700 dark:border-zinc-500 dark:bg-zinc-700 dark:text-zinc-300" },
  { id: "inprogress", label: "In Progress", dot: "bg-amber-400", active: "border-amber-500 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-300" },
  { id: "done", label: "Done", dot: "bg-emerald-400", active: "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { id: "completed", label: "Completed", dot: "bg-purple-400", active: "border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-900/30 dark:text-purple-300" },
];

const inactiveBtn = "border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800";

const statusLabels = {
  todo: { label: "To Do", color: "text-blue-600 dark:text-blue-400" },
  backlog: { label: "Backlog", color: "text-zinc-600 dark:text-zinc-400" },
  inprogress: { label: "In Progress", color: "text-amber-600 dark:text-amber-400" },
  done: { label: "Done", color: "text-emerald-600 dark:text-emerald-400" },
  completed: { label: "Completed", color: "text-purple-600 dark:text-purple-400" },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TaskDetailModal({ task, onClose, onUpdate }) {
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  if (!task) return null;

  const statusInfo = statusLabels[task.status] || statusLabels.todo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl mx-4 min-h-[70vh] rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden flex flex-col">
        <div className="p-8 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
              {task.title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Description */}
          <div className="mt-4 flex-1">
            {editingDesc ? (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  rows={10}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 resize-none"
                  placeholder="Add a description..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingDesc(false)}
                    className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onUpdate(task._id, { description: descDraft.trim() });
                      setEditingDesc(false);
                    }}
                    className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setDescDraft(task.description || "");
                  setEditingDesc(true);
                }}
                className="group/desc cursor-pointer rounded-lg p-3 -m-2 min-h-[200px] h-full hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                {task.description ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {task.description}
                    <span className="ml-2 text-[11px] text-zinc-400 dark:text-zinc-500 opacity-0 group-hover/desc:opacity-100 transition-opacity">
                      click to edit
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-zinc-400 dark:text-zinc-600 italic">
                    Click to add description...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Status selector */}
          <div className="mt-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Status
            </p>
            <div className="flex flex-wrap gap-2">
              {allStatuses.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onUpdate(task._id, { status: s.id })}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    task.status === s.id ? s.active : inactiveBtn
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Details grid */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Priority
              </p>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${priorityDots[task.priority]}`} />
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Period
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                {task.period}
              </p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Created
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {formatDate(task.createdAt)}
              </p>
            </div>
          </div>

          {task.updatedAt && task.updatedAt !== task.createdAt && (
            <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
              Last updated {formatDate(task.updatedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
