const express = require("express");
const router = express.Router();
const Scheduler = require("../models/Scheduler");
const { sendMail } = require("../utils/mailer");

const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());
const normalizeDateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

router.get("/check", async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    const startDateRaw = String(req.query.startDate || "").trim();
    if (!email || !startDateRaw) {
      return res.status(400).json({ success: false, message: "email and startDate are required" });
    }
    const sd = new Date(startDateRaw);
    if (!isValidDate(sd)) return res.status(400).json({ success: false, message: "Invalid startDate" });
    const startDate = normalizeDateOnly(sd);

    const existing = await Scheduler.findOne({ email, startDate });
    return res.json({ success: true, exists: !!existing, id: existing?._id || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create schedule
router.post("/", async (req, res) => {
  try {
    const body = req.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    const studentName = String(body.studentName || "").trim();
    const year = String(body.year || "").trim();
    const semester = String(body.semester || "").trim();
    const startDateIn = new Date(body.startDate);

    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }
    if (!studentName || !/^[A-Za-z ]+$/.test(studentName)) {
      return res.status(400).json({ success: false, message: "studentName must contain letters only" });
    }
    if (!/^[1-4]$/.test(year)) {
      return res.status(400).json({ success: false, message: "year must be 1-4" });
    }
    if (!["Semester 1", "Semester 2"].includes(semester)) {
      return res.status(400).json({ success: false, message: "semester must be Semester 1 or Semester 2" });
    }
    if (!isValidDate(startDateIn)) {
      return res.status(400).json({ success: false, message: "Invalid startDate" });
    }

    const startDate = normalizeDateOnly(startDateIn);

    const existing = await Scheduler.findOne({ email, startDate });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A schedule already exists for this email and start date. Please re-edit instead of creating a new one.",
        id: existing._id,
      });
    }

    const lectures = Array.isArray(body.lectures) ? body.lectures : [];
    if (lectures.length === 0) {
      return res.status(400).json({ success: false, message: "At least 1 lecture module is required" });
    }

    const events = Array.isArray(body.events) ? body.events : [];
    // Validate events are within 7 days range if present
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    for (const ev of events) {
      if (!ev?.date) continue;
      const d = normalizeDateOnly(new Date(ev.date));
      if (!isValidDate(d)) {
        return res.status(400).json({ success: false, message: "Invalid event date" });
      }
      if (d < startDate || d > endDate) {
        return res.status(400).json({ success: false, message: "Event date must be within the selected week (7 days)" });
      }
    }

    const newSchedule = new Scheduler({
      email,
      studentName,
      year,
      semester,
      startDate,
      lectures,
      events,
      generated: body.generated || null,
    });
    await newSchedule.save();

    // Confirmation email (best effort)
    try {
      await sendMail({
        to: email,
        subject: "EduPulse Weekly Scheduler Created",
        text: `Hi ${studentName},\n\nYour weekly scheduler has been created successfully for week starting ${startDate.toDateString()}.\n\nEduPulse`,
        html: `<p>Hi <b>${studentName}</b>,</p><p>Your weekly scheduler has been created successfully for week starting <b>${startDate.toDateString()}</b>.</p><p>EduPulse</p>`,
      });
    } catch (e) {
      // ignore if email not configured
    }

    res.json({ success: true, data: newSchedule });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A schedule already exists for this email and start date.",
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all schedules
router.get("/", async (req, res) => {
  try {
    const schedules = await Scheduler.find();
    res.json({ success: true, data: schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single schedule by ID
router.get("/:id", async (req, res) => {
  try {
    const schedule = await Scheduler.findById(req.params.id);
    res.json({ success: true, data: schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update schedule
router.put("/:id", async (req, res) => {
  try {
    const updated = await Scheduler.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete schedule
router.delete("/:id", async (req, res) => {
  try {
    await Scheduler.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;