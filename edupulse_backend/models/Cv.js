const mongoose = require("mongoose");

const CvSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CvTemplate",
  },
  data: {
    personal: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      website: String,
      linkedin: String,
      github: String,
    },
    summary: String,
    education: [{
      institution: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date,
      gpa: String,
      description: String,
    }],
    experience: [{
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      description: String,
      achievements: [String],
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      startDate: Date,
      endDate: Date,
      url: String,
    }],
    skills: [{
      name: String,
      level: String,
      category: String,
    }],
    links: [{
      title: String,
      url: String,
    }],
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Cv", CvSchema);