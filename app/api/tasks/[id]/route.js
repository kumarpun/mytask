import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/lib/models/Task";

// PATCH /api/tasks/:id
export async function PATCH(request, { params }) {
  await connectDB();
  const { id } = await params;
  const body = await request.json();

  const task = await Task.findByIdAndUpdate(id, body, { new: true });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

// DELETE /api/tasks/:id
export async function DELETE(request, { params }) {
  await connectDB();
  const { id } = await params;

  const task = await Task.findByIdAndDelete(id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
