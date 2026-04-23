const mongoose = require("mongoose");

const ResumeScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cvId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cv",
    required: true,
  },
  targetRoleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CareerRole",
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  suggestions: [{
    type: String,
  }],
  feedback: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("ResumeScore", ResumeScoreSchema);