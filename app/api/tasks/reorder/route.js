import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/lib/models/Task";

// POST /api/tasks/reorder
// Body: { orderedIds: string[] }
export async function POST(request) {
  await connectDB();
  const { orderedIds } = await request.json();

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json({ error: "orderedIds required" }, { status: 400 });
  }

  const ops = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index } },
    },
  }));

  await Task.bulkWrite(ops);

  return NextResponse.json({ success: true });
}
