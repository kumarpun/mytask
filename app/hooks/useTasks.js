"use client";
import { useState, useEffect, useCallback } from "react";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Daily reset: move "done" tasks back to "todo" at configured time
  const checkDailyReset = useCallback(async () => {
    const resetHour = parseInt(localStorage.getItem("routine-reset-hour") || "0", 10);
    const now = new Date();

    // Calculate the reset boundary for the current cycle
    const resetDate = new Date(now);
    resetDate.setHours(resetHour, 0, 0, 0);

    // If we haven't reached today's reset time, the current cycle started yesterday
    if (now < resetDate) {
      resetDate.setDate(resetDate.getDate() - 1);
    }

    const resetKey = resetDate.toDateString();
    const lastReset = localStorage.getItem("routine-last-reset");
    if (lastReset === resetKey) return false;

    try {
      const res = await fetch("/api/tasks/reset", { method: "POST" });
      if (res.ok) {
        localStorage.setItem("routine-last-reset", resetKey);
        const data = await res.json();
        return data.reset > 0;
      }
    } catch (err) {
      console.error("Failed to reset tasks:", err);
    }
    return false;
  }, []);

  useEffect(() => {
    async function init() {
      const didReset = await checkDailyReset();
      await fetchTasks();
      if (!didReset) return;
    }
    init();
  }, [fetchTasks, checkDailyReset]);

  async function addTask(task) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (res.ok) {
      const created = await res.json();
      setTasks((prev) => [created, ...prev]);
      return created;
    }
  }

  async function updateTask(taskId, updates) {
    // Optimistic update — UI moves instantly
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, ...updates } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
        return updated;
      } else {
        // Revert on failure
        await fetchTasks();
      }
    } catch {
      await fetchTasks();
    }
  }

  async function deleteTask(taskId) {
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    }
  }

  async function resetDoneTasks() {
    try {
      const res = await fetch("/api/tasks/reset", { method: "POST" });
      if (res.ok) {
        localStorage.setItem("routine-last-reset", new Date().toDateString());
        await fetchTasks();
      }
    } catch (err) {
      console.error("Failed to reset tasks:", err);
    }
  }

  return { tasks, isLoaded, addTask, updateTask, deleteTask, resetDoneTasks };
}
