"use client";
import { useState, useEffect, useCallback } from "react";

export function useStreak() {
  const [streak, setStreak] = useState({
    currentStreak: 0,
    bestStreak: 0,
    todayComplete: false,
    todayProgress: { done: 0, total: 0 },
  });

  const fetchStreak = useCallback(async () => {
    try {
      const res = await fetch("/api/streak");
      if (res.ok) {
        const data = await res.json();
        setStreak(data);
      }
    } catch {
      // ignore
    }
  }, []);

  const refreshStreak = useCallback(async () => {
    try {
      await fetch("/api/streak/check", { method: "POST" });
      await fetchStreak();
    } catch {
      // ignore
    }
  }, [fetchStreak]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return { streak, refreshStreak };
}
