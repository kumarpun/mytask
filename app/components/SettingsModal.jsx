"use client";
import { useState, useEffect } from "react";

const hours = Array.from({ length: 24 }, (_, i) => {
  const period = i < 12 ? "AM" : "PM";
  const h = i === 0 ? 12 : i > 12 ? i - 12 : i;
  return { value: i, label: `${h}:00 ${period}` };
});

export default function SettingsModal({ isOpen, onClose }) {
  const [resetHour, setResetHour] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("routine-reset-hour");
      setResetHour(stored ? parseInt(stored, 10) : 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleChange(value) {
    const hour = parseInt(value, 10);
    setResetHour(hour);
    localStorage.setItem("routine-reset-hour", String(hour));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Settings
          </h2>
          <button
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
        <div className="px-6 py-5 space-y-5">
          {/* Reset time */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
              Daily Reset Time
            </label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              Tasks in &ldquo;Done&rdquo; will move back to &ldquo;To Do&rdquo; after this time each day.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {hours.map((h) => (
                <button
                  key={h.value}
                  onClick={() => handleChange(h.value)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    resetHour === h.value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-zinc-200 dark:border-zinc-700/60 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
