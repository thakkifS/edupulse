const mongoose = require("mongoose");

const JobRoleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["full-time", "part-time", "contract", "internship"],
    default: "full-time",
  },
  experience: {
    type: String,
    enum: ["entry-level", "mid-level", "senior-level", "lead", "manager"],
    default: "mid-level",
  },
  salary: {
    type: String,
    required: true,
  },
  requirements: [{
    type: String,
  }],
  responsibilities: [{
    type: String,
  }],
  skills: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("JobRole", JobRoleSchema);