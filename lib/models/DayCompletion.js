import mongoose from "mongoose";

const DayCompletionSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // "2026-03-24"
    completed: { type: Boolean, default: false },
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.DayCompletion ||
  mongoose.model("DayCompletion", DayCompletionSchema);
