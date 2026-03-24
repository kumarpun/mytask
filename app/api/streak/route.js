import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DayCompletion from "@/lib/models/DayCompletion";
import Task from "@/lib/models/Task";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function calcStreaks(completedDates, todayComplete) {
  // Build a set of completed date strings
  const dateSet = new Set(completedDates);
  if (todayComplete) dateSet.add(getTodayStr());

  // Current streak: walk backward from today
  let currentStreak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().split("T")[0];
    if (dateSet.has(key)) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  // Best streak: walk forward through all dates sorted ascending
  const sorted = [...dateSet].sort();
  let bestStreak = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      run = diff === 1 ? run + 1 : 1;
    }
    bestStreak = Math.max(bestStreak, run);
  }

  return { currentStreak, bestStreak };
}

// GET /api/streak
export async function GET() {
  await connectDB();

  const today = getTodayStr();

  // Check today's live status
  const dayTasks = await Task.find({ period: "day" });
  const total = dayTasks.length;
  const done = dayTasks.filter(
    (t) => t.status === "done" || t.status === "completed"
  ).length;
  const todayComplete = total > 0 && done === total;

  // Get all completed days
  const completions = await DayCompletion.find({ completed: true }).select("date");
  const completedDates = completions.map((c) => c.date);

  const { currentStreak, bestStreak } = calcStreaks(completedDates, todayComplete);

  return NextResponse.json({
    currentStreak,
    bestStreak,
    todayComplete,
    todayProgress: { done, total },
  });
}
