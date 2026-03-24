import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DayCompletion from "@/lib/models/DayCompletion";
import Task from "@/lib/models/Task";

// POST /api/streak/check — evaluate and record today's completion
export async function POST() {
  await connectDB();

  const today = new Date().toISOString().split("T")[0];

  const dayTasks = await Task.find({ period: "day" });
  const total = dayTasks.length;
  const done = dayTasks.filter(
    (t) => t.status === "done" || t.status === "completed"
  ).length;

  // No tasks = completed (don't break streak on rest days)
  const completed = total === 0 || done === total;

  await DayCompletion.findOneAndUpdate(
    { date: today },
    { completed, totalTasks: total, completedTasks: done },
    { upsert: true, new: true }
  );

  return NextResponse.json({ date: today, completed, done, total });
}
