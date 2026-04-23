const mongoose = require("mongoose");

const roadmapStepSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    skills: [{ type: String }],
    certifications: [{ type: String }],
    projects: [{ type: String }],
    resources: [{ type: String }],
  },
  { _id: false }
);

const careerRoadmapSchema = new mongoose.Schema(
  {
    careerRoleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CareerRole",
      required: true,
      unique: true,
    },
    steps: [roadmapStepSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareerRoadmap", careerRoadmapSchema);