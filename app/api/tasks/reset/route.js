import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/lib/models/Task";
import DayCompletion from "@/lib/models/DayCompletion";

// POST /api/tasks/reset — snapshot completion, then move "done" tasks to "todo"
export async function POST() {
  await connectDB();

  // Snapshot today's completion before resetting
  const today = new Date().toISOString().split("T")[0];
  const dayTasks = await Task.find({ period: "day" });
  const total = dayTasks.length;
  const done = dayTasks.filter(
    (t) => t.status === "done" || t.status === "completed"
  ).length;
  const completed = total === 0 || done === total;

  await DayCompletion.findOneAndUpdate(
    { date: today },
    { completed, totalTasks: total, completedTasks: done },
    { upsert: true, new: true }
  );

  // Reset done tasks to todo
  const result = await Task.updateMany(
    { status: "done" },
    { $set: { status: "todo" } }
  );

  return NextResponse.json({ reset: result.modifiedCount });
}
