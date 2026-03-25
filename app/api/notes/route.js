import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Note from "@/lib/models/Note";

// GET /api/notes
export async function GET() {
  await connectDB();
  const notes = await Note.find().sort({ pinned: -1, updatedAt: -1 });
  return NextResponse.json(notes);
}

// POST /api/notes
export async function POST(request) {
  await connectDB();
  const body = await request.json();
  const note = await Note.create(body);
  return NextResponse.json(note, { status: 201 });
}
