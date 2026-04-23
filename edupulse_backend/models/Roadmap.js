const mongoose = require("mongoose");

const RoadmapSchema = new mongoose.Schema({
  careerRoleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CareerRole",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  steps: [{
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    resources: [{
      name: String,
      url: String,
      type: {
        type: String,
        enum: ["course", "article", "video", "book"],
        default: "article",
      },
    }],
    estimatedTime: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  }],
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "intermediate",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Roadmap", RoadmapSchema);
