"use client";
import { useState, useMemo, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTasks } from "./hooks/useTasks";
import { useTheme } from "./components/ThemeProvider";
import KanbanBoard from "./components/KanbanBoard";
import BacklogView from "./components/BacklogView";
import CompletedView from "./components/CompletedView";
import QuoteCard from "./components/QuoteCard";
import StreakBadge from "./components/StreakBadge";
import { useStreak } from "./hooks/useStreak";
import Toast from "./components/Toast";

// Lazy-load modals — not needed until user interaction
const TaskModal = lazy(() => import("./components/TaskModal"));
const SettingsModal = lazy(() => import("./components/SettingsModal"));
const SearchModal = lazy(() => import("./components/SearchModal"));
const TaskDetailModal = lazy(() => import("./components/TaskDetailModal"));
const AchievementToast = lazy(() => import("./components/AchievementToast"));

const TABS = [
  { id: "day", label: "Today", icon: "☀️" },
  { id: "week", label: "This Week", icon: "📅" },
  { id: "month", label: "This Month", icon: "🗓️" },
  { id: "backlog", label: "Backlog", icon: "📦" },
  { id: "completed", label: "Completed", icon: "🏆" },
];

function getNPTHour() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })).getHours();
}

function getGreeting() {
  const hour = getNPTHour();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kathmandu",
  });
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { tasks, isLoaded, addTask, updateTask, deleteTask, resetDoneTasks, reorderTasks } = useTasks();
  const { streak, refreshStreak } = useStreak();
  const [activeTab, setActiveTab] = useState("day");
  const [showAchievement, setShowAchievement] = useState(false);
  const [toast, setToast] = useState(null);
  const prevTodayComplete = useRef(false);

  useEffect(() => {
    // Show achievement when todayComplete flips from false to true
    if (streak.todayComplete && !prevTodayComplete.current && streak.todayProgress.total > 0) {
      setShowAchievement(true);
    }
    prevTodayComplete.current = streak.todayComplete;
  }, [streak.todayComplete, streak.todayProgress.total]);

  // Cmd/Ctrl+K to open search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const dismissAchievement = useCallback(() => setShowAchievement(false), []);
  const dismissToast = useCallback(() => setToast(null), []);

  const statusToasts = {
    done: { message: "Task moved to Done", icon: "✅" },
    completed: { message: "Task completed!", icon: "🏆" },
    todo: { message: "Task moved to To Do", icon: "📌" },
    inprogress: { message: "Task in progress", icon: "🔄" },
    backlog: { message: "Task moved to Backlog", icon: "📦" },
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const isBacklogTab = activeTab === "backlog";
  const isCompletedTab = activeTab === "completed";
  const isSpecialTab = isBacklogTab || isCompletedTab;

  // For period tabs: filter by period, exclude backlog and completed status
  const boardTasks = useMemo(
    () => tasks.filter((t) => t.period === activeTab && t.status !== "backlog" && t.status !== "completed"),
    [tasks, activeTab]
  );

  // For backlog tab: all backlog status tasks across all periods
  const backlogTasks = useMemo(
    () => tasks.filter((t) => t.status === "backlog"),
    [tasks]
  );

  // For completed tab: all completed status tasks across all periods
  const completedTasks = useMemo(
    () => tasks.filter((t) => t.status === "completed"),
    [tasks]
  );

  const stats = useMemo(() => {
    const total = boardTasks.length;
    const done = boardTasks.filter((t) => t.status === "done").length;
    const inProgress = boardTasks.filter((t) => t.status === "inprogress").length;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, percentage };
  }, [boardTasks]);

  const handleSaveTask = useCallback(async (taskData) => {
    if (editingTask) {
      await updateTask(editingTask._id, taskData);
    } else {
      await addTask(taskData);
    }
    setEditingTask(null);
    refreshStreak();
  }, [editingTask, updateTask, addTask, refreshStreak]);

  const handleMoveToTodo = useCallback(async (taskId) => {
    await updateTask(taskId, { status: "todo" });
    setToast(statusToasts.todo);
    refreshStreak();
  }, [updateTask, refreshStreak]);

  const handleUpdateTask = useCallback(async (taskId, updates) => {
    if (updates.status) {
      const task = tasks.find((t) => t._id === taskId);
      if (task && task.status === updates.status) return;
    }
    await updateTask(taskId, updates);
    if (updates.status) {
      const t = statusToasts[updates.status];
      if (t) setToast(t);
      refreshStreak();
    }
  }, [tasks, updateTask, refreshStreak]);

  const handleDeleteTask = useCallback(async (taskId) => {
    await deleteTask(taskId);
    setToast({ message: "Task deleted", icon: "🗑️" });
    refreshStreak();
  }, [deleteTask, refreshStreak]);

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Status Toast */}
      <Toast
        show={!!toast}
        message={toast?.message}
        icon={toast?.icon}
        onClose={dismissToast}
      />

      {/* Achievement Toast */}
      {showAchievement && (
        <Suspense fallback={null}>
          <AchievementToast
            show={showAchievement}
            streak={streak.currentStreak}
            onClose={dismissAchievement}
          />
        </Suspense>
      )}

      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-4 py-1.5 sm:px-6">
          {/* Top row: greeting + actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 truncate">
                {getGreeting()} 👋
              </h1>
              <div className="mt-0.5 flex items-center gap-2 sm:gap-3">
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 hidden sm:block">
                  {getFormattedDate()}
                </p>
                <StreakBadge streak={streak} />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex h-9 sm:h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 sm:px-3 sm:min-w-[200px] text-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700 transition-colors"
                title="Search tasks (Cmd+K)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="hidden sm:inline text-xs text-zinc-400 dark:text-zinc-500 flex-1 text-left">Search tasks...</span>
                <kbd className="hidden md:flex items-center rounded border border-zinc-200 bg-white px-1 py-0.5 text-[10px] font-medium text-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-500">
                  &#8984;K
                </kbd>
              </button>

              {/* Add Task */}
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
                className="flex h-9 sm:h-10 items-center gap-2 rounded-xl bg-indigo-600 px-3 sm:px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="shrink-0">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="hidden sm:inline">Add Task</span>
              </button>

              {/* Reset done tasks */}
              <button
                onClick={resetDoneTasks}
                className="hidden sm:flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors"
                title="Reset done tasks to to do"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>

              {/* Notes */}
              <Link
                href="/notes"
                className="flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors"
                title="Notes"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </Link>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              {/* Settings */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors"
                title="Settings"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        {/* Motivational Quote */}
        {!isSpecialTab && <QuoteCard />}

        {/* Tabs + Stats */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/80 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === t.id
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                }`}
              >
                <span className="text-sm sm:text-base">{t.icon}</span>
                {t.label}
                {t.id === "backlog" && backlogTasks.length > 0 && (
                  <span className="ml-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-200/80 px-1.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-600 dark:text-zinc-300">
                    {backlogTasks.length}
                  </span>
                )}
                {t.id === "completed" && completedTasks.length > 0 && (
                  <span className="ml-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-200/80 px-1.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-600 dark:text-zinc-300">
                    {completedTasks.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Progress stats — only for period tabs */}
          {!isSpecialTab && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {stats.percentage}%
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span>
                  {stats.done}/{stats.total} done
                </span>
                <span className="text-zinc-300 dark:text-zinc-600">|</span>
                <span>{stats.inProgress} in progress</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {isBacklogTab ? (
          <BacklogView
            tasks={backlogTasks}
            onMoveToTodo={handleMoveToTodo}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
            onUpdate={handleUpdateTask}
          />
        ) : isCompletedTab ? (
          <CompletedView
            tasks={completedTasks}
            onMoveToTodo={handleMoveToTodo}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
            onUpdate={handleUpdateTask}
          />
        ) : (
          <>
            <KanbanBoard
              tasks={boardTasks}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
              onReorder={reorderTasks}
              currentPeriod={activeTab}
            />

            {/* Empty state */}
            {boardTasks.length === 0 && (
              <div className="mt-8 flex flex-col items-center justify-center py-16 text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                  No tasks for{" "}
                  {TABS.find((t) => t.id === activeTab)?.label.toLowerCase()}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Click &ldquo;Add Task&rdquo; to plan your{" "}
                  {activeTab === "day"
                    ? "day"
                    : activeTab === "week"
                      ? "week"
                      : "month"}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Lazy-loaded modals */}
      <Suspense fallback={null}>
        {isModalOpen && (
          <TaskModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingTask(null);
            }}
            onSave={handleSaveTask}
            editingTask={editingTask}
            currentPeriod={isSpecialTab ? "day" : activeTab}
          />
        )}

        {isSearchOpen && (
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            tasks={tasks}
            onView={setViewingTask}
          />
        )}

        {viewingTask && (
          <TaskDetailModal
            task={tasks.find((t) => t._id === viewingTask._id) || viewingTask}
            onClose={() => setViewingTask(null)}
            onUpdate={handleUpdateTask}
          />
        )}

        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
