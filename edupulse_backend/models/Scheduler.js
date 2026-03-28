// models/Scheduler.js
const mongoose = require("mongoose");

const LectureSchema = new mongoose.Schema({
  moduleName: String,
  credit: Number,
  lectureType: { type: String, enum: ["Logical", "Theory"], default: "Theory" },
  todo: [String],
});

const EventSchema = new mongoose.Schema({
  eventType: { type: String, enum: ["Exam","Viva","Presentation","Lecture","SpotTest","Other"] },
  moduleName: String,
  date: Date,
  time: String,
  description: String,
  logicalOrTheory: { type: String, enum: ["Logical","Theory"], default: "Theory" },
});

const SchedulerSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  studentName: String,
  year: String,
  semester: String,
  startDate: Date,
  lectures: [LectureSchema],
  events: [EventSchema],
  generated: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now },
});

SchedulerSchema.index({ email: 1, startDate: 1 }, { unique: true });

module.exports = mongoose.model("Scheduler", SchedulerSchema);