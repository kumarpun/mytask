"use client";
import { useState, useEffect } from "react";

const priorities = [
  { id: "low", label: "Low", dot: "bg-blue-400", activeBg: "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300" },
  { id: "medium", label: "Medium", dot: "bg-yellow-400", activeBg: "border-yellow-500 bg-yellow-50 text-yellow-700 dark:border-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { id: "high", label: "High", dot: "bg-red-400", activeBg: "border-red-500 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-900/30 dark:text-red-300" },
];

const periods = [
  { id: "day", label: "Today", icon: "☀️" },
  { id: "week", label: "This Week", icon: "📅" },
  { id: "month", label: "This Month", icon: "🗓️" },
];

const createStatuses = [
  { id: "todo", label: "To Do", dot: "bg-blue-400" },
  { id: "backlog", label: "Backlog", dot: "bg-zinc-400" },
];

const allStatuses = [
  { id: "todo", label: "To Do", dot: "bg-blue-400" },
  { id: "backlog", label: "Backlog", dot: "bg-zinc-400" },
  { id: "inprogress", label: "In Progress", dot: "bg-amber-400" },
  { id: "done", label: "Done", dot: "bg-emerald-400" },
  { id: "completed", label: "Completed", dot: "bg-purple-400" },
];

const statusActiveColors = {
  todo: "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300",
  backlog: "border-zinc-500 bg-zinc-100 text-zinc-700 dark:border-zinc-500 dark:bg-zinc-700 dark:text-zinc-300",
  inprogress: "border-amber-500 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-300",
  done: "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-300",
  completed: "border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-900/30 dark:text-purple-300",
};

const inactiveBtn = "border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800";

export default function TaskModal({ isOpen, onClose, onSave, editingTask, currentPeriod }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [period, setPeriod] = useState(currentPeriod || "day");
  const [status, setStatus] = useState("todo");

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || "");
      setPriority(editingTask.priority);
      setPeriod(editingTask.period);
      setStatus(editingTask.status);
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setPeriod(currentPeriod || "day");
      setStatus("todo");
    }
  }, [editingTask, currentPeriod, isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      period,
      status: status || "todo",
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-3xl mx-4 flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700/60 px-8 py-5">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {editingTask ? "Edit Task" : "New Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-8 py-4 space-y-4 overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Title
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-800 transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task..."
              rows={4}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-800 resize-none transition-colors"
            />
          </div>

          {/* Add to / Status */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              {editingTask ? "Status" : "Add to"}
            </label>
            <div className="flex flex-wrap gap-2">
              {(editingTask ? allStatuses : createStatuses).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(status === s.id ? "" : s.id)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    status === s.id
                      ? `border-current bg-opacity-10 ${statusActiveColors[s.id]}`
                      : inactiveBtn
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    priority === p.id ? p.activeBg : inactiveBtn
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Period
            </label>
            <div className="flex gap-2">
              {periods.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    period === p.id
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : inactiveBtn
                  }`}
                >
                  <span className="text-base">{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-700/60 px-8 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
          >
            {editingTask ? "Save Changes" : "Add Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
