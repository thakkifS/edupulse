const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    roomKey: { type: String, required: true, index: true, trim: true },
    senderEmail: { type: String, required: true, trim: true },
    senderName: { type: String, default: "", trim: true },
    senderRole: { type: String, required: true, enum: ["student", "admin", "guest"] },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);