"use client";

export default function StreakBadge({ streak }) {
  const { currentStreak, bestStreak, todayComplete, todayProgress } = streak;

  return (
    <div className="flex items-center gap-4">
      {/* Current streak */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition-all ${
            currentStreak > 0
              ? "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          <span className="text-base">{currentStreak > 0 ? "🔥" : "💤"}</span>
          <span>{currentStreak}</span>
          <span className="text-xs font-medium opacity-70">
            day{currentStreak !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Best streak */}
      {bestStreak > 0 && (
        <div className="hidden sm:flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
          <span>🏆</span>
          <span>Best: {bestStreak}</span>
        </div>
      )}

      {/* Today's progress */}
      {todayProgress.total > 0 && (
        <div className="hidden sm:flex items-center gap-1.5">
          {todayComplete ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Today done
            </span>
          ) : (
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              {todayProgress.done}/{todayProgress.total} today
            </span>
          )}
        </div>
      )}
    </div>
  );
}
