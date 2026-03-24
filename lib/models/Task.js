import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    period: { type: String, enum: ["day", "week", "month"], default: "day" },
    status: {
      type: String,
      enum: ["todo", "backlog", "inprogress", "done", "completed"],
      default: "todo",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
