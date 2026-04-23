const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    Name: { type: String, required: true, trim: true },
    studentID: { type: String, required: true, unique: true, trim: true },
    PhoneNumber: { type: String, required: true, trim: true },
    Email: { type: String, required: true, unique: true, trim: true },
    Password: { type: String, required: true },
    role: { type: String, default: "student" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);