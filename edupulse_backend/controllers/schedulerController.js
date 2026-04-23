const Scheduler = require("../models/Scheduler");
const { sendMail } = require("../utils/mailer");

const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());
const normalizeDateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// GET /api/scheduler/check?email=&startDate=
exports.checkSchedule = async (req, res, next) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    const startDateRaw = String(req.query.startDate || "").trim();

    if (!email || !startDateRaw) {
      return res.status(400).json({ success: false, message: "email and startDate are required" });
    }

    const sd = new Date(startDateRaw);
    if (!isValidDate(sd)) {
      return res.status(400).json({ success: false, message: "Invalid startDate" });
    }

    const startDate = normalizeDateOnly(sd);
    const existing = await Scheduler.findOne({ email, startDate });
    res.json({ success: true, exists: !!existing, id: existing?._id || null });
  } catch (err) {
    next(err);
  }
};

// GET /api/scheduler
exports.getAllSchedules = async (req, res, next) => {
  try {
    const schedules = await Scheduler.find();
    res.json({ success: true, data: schedules });
  } catch (err) {
    next(err);
  }
};

// GET /api/scheduler/:id
exports.getScheduleById = async (req, res, next) => {
  try {
    const schedule = await Scheduler.findById(req.params.id);
    res.json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
};

// POST /api/scheduler
exports.createSchedule = async (req, res, next) => {
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
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    for (const ev of events) {
      if (!ev?.date) continue;
      const d = normalizeDateOnly(new Date(ev.date));
      if (!isValidDate(d)) {
        return res.status(400).json({ success: false, message: "Invalid event date" });
      }
      if (d < startDate || d > endDate) {
        return res.status(400).json({
          success: false,
          message: "Event date must be within the selected week (7 days)",
        });
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

    try {
      await sendMail({
        to: email,
        subject: "EduPulse Weekly Scheduler Created",
        text: `Hi ${studentName},\n\nYour weekly scheduler has been created successfully for week starting ${startDate.toDateString()}.\n\nEduPulse`,
        html: `<p>Hi <b>${studentName}</b>,</p><p>Your weekly scheduler has been created successfully for week starting <b>${startDate.toDateString()}</b>.</p><p>EduPulse</p>`,
      });
    } catch (_) {
      // Email not configured — ignore silently
    }

    res.json({ success: true, data: newSchedule });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A schedule already exists for this email and start date.",
      });
    }
    next(err);
  }
};

// PUT /api/scheduler/:id
exports.updateSchedule = async (req, res, next) => {
  try {
    const updated = await Scheduler.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/scheduler/:id
exports.deleteSchedule = async (req, res, next) => {
  try {
    await Scheduler.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};