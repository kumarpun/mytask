"use client";
import TaskCard from "./TaskCard";

export default function CompletedView({ tasks, onDelete, onEdit, onUpdate, onMoveToTodo }) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">🏆</div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
          No completed tasks yet
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Tasks moved to completed will appear here
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} completed
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tasks.map((task) => (
          <div key={task._id} className="flex flex-col gap-2">
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
    </div>
  );
}
