import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Note from "@/lib/models/Note";

// PATCH /api/notes/:id
export async function PATCH(request, { params }) {
  await connectDB();
  const { id } = await params;
  const body = await request.json();
  const note = await Note.findByIdAndUpdate(id, body, { new: true });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(note);
}

// DELETE /api/notes/:id
export async function DELETE(request, { params }) {
  await connectDB();
  const { id } = await params;
  await Note.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
