const mongoose = require("mongoose");

const CareerRoleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  skills: [{
    type: String,
  }],
  salaryRange: {
    type: String,
  required: true,
  },
  demand: {
    type: String,
    enum: ["high", "medium", "low"],
    default: "medium",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("CareerRole", CareerRoleSchema);