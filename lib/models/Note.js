import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled", trim: true },
    content: { type: String, default: "" },
    pinned: { type: Boolean, default: false },
    folder: { type: String, default: "All Notes", trim: true },
  },
  { timestamps: true }
);

NoteSchema.index({ pinned: -1, updatedAt: -1 });

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
