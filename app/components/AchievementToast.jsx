"use client";
import { useEffect, useState } from "react";

export default function AchievementToast({ show, streak, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className={`fixed top-6 left-1/2 z-[60] -translate-x-1/2 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 px-6 py-4 shadow-xl dark:border-amber-700/50 dark:from-amber-950/60 dark:via-yellow-950/40 dark:to-orange-950/40">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
          <span className="text-2xl">🏆</span>
        </div>
        <div>
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
            All Tasks Completed!
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {streak > 1
              ? `Amazing! ${streak}-day streak 🔥`
              : "Great job! Keep it up tomorrow 💪"}
          </p>
        </div>
      </div>
    </div>
  );
}
