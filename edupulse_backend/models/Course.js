const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator(v) {
          return Array.isArray(v) && v.length === 4 && v.every((s) => String(s).trim().length > 0);
        },
        message: "Each question needs exactly 4 non-empty options",
      },
    },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    questions: {
      type: [questionSchema],
      validate: {
        validator(v) {
          return Array.isArray(v) && v.length === 50;
        },
        message: "A course must have exactly 50 MCQ questions",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);