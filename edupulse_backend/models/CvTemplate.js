const mongoose = require("mongoose");

const CvTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  previewImageUrl: {
    type: String,
    required: true,
  },
  htmlTemplate: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["professional", "creative", "modern", "minimal"],
    default: "professional",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("CvTemplate", CvTemplateSchema);