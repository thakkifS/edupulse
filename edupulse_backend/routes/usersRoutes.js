const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Admin: list users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: get one user by Mongo _id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: create user
router.post("/", async (req, res) => {
  try {
    const { Name, studentID, PhoneNumber, Email, Password, role } = req.body || {};
    if (!Name || !studentID || !PhoneNumber || !Email || !Password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await User.findOne({
      $or: [{ Email: String(Email).toLowerCase().trim() }, { studentID: String(studentID).toUpperCase().trim() }],
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email or Student ID already exists" });
    }

    const created = await User.create({
      Name: String(Name).trim(),
      studentID: String(studentID).toUpperCase().trim(),
      PhoneNumber: String(PhoneNumber).trim(),
      Email: String(Email).toLowerCase().trim(),
      Password: String(Password).trim(),
      role: role ? String(role).trim() : "student",
    });

    res.status(201).json({ success: true, message: "User created", data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: update user (password optional)
router.put("/:id", async (req, res) => {
  try {
    const updates = {};
    const allowed = ["Name", "studentID", "PhoneNumber", "Email", "Password", "role"];
    for (const key of allowed) {
      if (req.body?.[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.Name !== undefined) updates.Name = String(updates.Name).trim();
    if (updates.studentID !== undefined) updates.studentID = String(updates.studentID).toUpperCase().trim();
    if (updates.PhoneNumber !== undefined) updates.PhoneNumber = String(updates.PhoneNumber).trim();
    if (updates.Email !== undefined) updates.Email = String(updates.Email).toLowerCase().trim();
    if (updates.Password !== undefined) updates.Password = String(updates.Password).trim();
    if (updates.role !== undefined) updates.role = String(updates.role).trim();

    const updated = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: delete user
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted", data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

