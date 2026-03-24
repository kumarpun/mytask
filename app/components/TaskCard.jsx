"use client";
import { useState } from "react";

const priorityColors = {
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const priorityDots = {
  low: "bg-blue-400",
  medium: "bg-yellow-400",
  high: "bg-red-400",
};

const statusLabels = {
  todo: { label: "To Do", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
  backlog: { label: "Backlog", color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-100 dark:bg-zinc-800" },
  inprogress: { label: "In Progress", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  done: { label: "Done", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  completed: { label: "Completed", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
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

export default function TaskCard({ task, onDelete, onEdit, onUpdate }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  function handleDragStart(e) {
    e.dataTransfer.setData("taskId", task._id);
    e.target.style.opacity = "0.5";
  }

  function handleDragEnd(e) {
    e.target.style.opacity = "1";
  }

  const statusInfo = statusLabels[task.status] || statusLabels.todo;

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="group relative h-[120px] flex flex-col rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 hover:-translate-y-1 hover:scale-[1.02] dark:border-zinc-700/60 dark:bg-zinc-800/80 dark:hover:border-zinc-600 cursor-grab active:cursor-grabbing active:scale-[0.98]"
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
            {task.title}
          </h4>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => setShowDetail(true)}
              className="rounded-md p-1 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
              title="View"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            <button
              onClick={() => onEdit(task)}
              className="rounded-md p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              title="Edit"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-md p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              title="Delete"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>

        {task.description && (
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${priorityColors[task.priority]}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priorityDots[task.priority]}`} />
              {task.priority}
            </span>
            {task.period && (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {task.period}
              </span>
            )}
          </div>
          {task.status === "done" && onUpdate && (
            <button
              onClick={() => onUpdate(task._id, { status: "completed" })}
              className="flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              Move to Complete
            </button>
          )}
        </div>
      </div>

      {/* Task detail modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDetail(false)}
          />
          <div className="relative w-full max-w-3xl mx-4 min-h-[70vh] rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden flex flex-col">
            <div className="p-8 flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {task.title}
                </h2>
                <button
                  onClick={() => setShowDetail(false)}
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

              {/* Details grid */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Status
                  </p>
                  <p className={`mt-1 text-sm font-semibold ${statusInfo.color}`}>
                    {statusInfo.label}
                  </p>
                </div>
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
      )}

      {/* Delete confirmation popup */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h3 className="mt-4 text-center text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Delete Task
            </h3>
            <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Are you sure you want to delete{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                &ldquo;{task.title}&rdquo;
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  onDelete(task._id);
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
