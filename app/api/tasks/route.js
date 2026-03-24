import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/lib/models/Task";

// GET /api/tasks?period=day
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period");

  const filter = period ? { period } : {};
  const tasks = await Task.find(filter).sort({ createdAt: -1 });

  return NextResponse.json(tasks);
}

// POST /api/tasks
export async function POST(request) {
  await connectDB();
  const body = await request.json();
  const task = await Task.create(body);

  return NextResponse.json(task, { status: 201 });
}
