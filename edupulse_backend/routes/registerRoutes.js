const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { Name, studentID, PhoneNumber, Email, Password } = req.body;
    if (!Name || !studentID || !PhoneNumber || !Email || !Password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await User.findOne({
      $or: [{ Email: Email.toLowerCase().trim() }, { studentID: studentID.toUpperCase().trim() }],
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email or Student ID already exists" });
    }

    const user = await User.create({
      Name: Name.trim(),
      studentID: studentID.toUpperCase().trim(),
      PhoneNumber: PhoneNumber.trim(),
      Email: Email.toLowerCase().trim(),
      Password: Password.trim(),
      role: "student",
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { Name: user.Name, Email: user.Email, studentID: user.studentID, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ Email: Email.toLowerCase().trim() });
    if (!user || user.Password !== Password) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      data: { Name: user.Name, Email: user.Email, studentID: user.studentID, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
