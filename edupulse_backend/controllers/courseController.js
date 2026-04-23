const mongoose = require("mongoose");
const Course = require("../models/Course");

const PASS_PERCENT = 80;
const REQUIRED_Q = 50;

const validateQuestionsPayload = (questions) => {
  if (!Array.isArray(questions) || questions.length !== REQUIRED_Q) {
    return `Exactly ${REQUIRED_Q} questions are required`;
  }
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const prompt = String(q?.prompt || "").trim();
    if (!prompt) return `Question ${i + 1}: prompt is required`;
    const opts = q?.options;
    if (!Array.isArray(opts) || opts.length !== 4) {
      return `Question ${i + 1}: need 4 options`;
    }
    for (let j = 0; j < 4; j++) {
      if (!String(opts[j] || "").trim()) return `Question ${i + 1}: option ${j + 1} is empty`;
    }
    const ci = Number(q?.correctIndex);
    if (!Number.isInteger(ci) || ci < 0 || ci > 3) {
      return `Question ${i + 1}: correct answer must be A–D (index 0–3)`;
    }
  }
  return null;
};

const normalizeQuestions = (questions) =>
  questions.map((q) => ({
    prompt: String(q.prompt).trim(),
    options: q.options.map((o) => String(o).trim()),
    correctIndex: Number(q.correctIndex),
  }));

// GET /api/courses
exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .select("courseCode name imageUrl description createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const data = courses.map((c) => ({
      id: c._id,
      courseCode: c.courseCode,
      name: c.name,
      imageUrl: c.imageUrl,
      description: c.description,
      questionCount: REQUIRED_Q,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/courses/search/:query
exports.searchCourses = async (req, res, next) => {
  try {
    const raw = String(req.params.query || "").trim();
    if (!raw) return res.json({ success: true, count: 0, data: [] });

    const rx = new RegExp(raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const courses = await Course.find({
      $or: [{ name: rx }, { courseCode: rx }, { description: rx }],
    })
      .select("courseCode name imageUrl description createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const data = courses.map((c) => ({ ...c, id: c._id, questionCount: REQUIRED_Q }));
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/courses/quiz/:id
exports.getCourseQuiz = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid course id" });
    }
    const course = await Course.findById(req.params.id).lean();
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (!course.questions || course.questions.length !== REQUIRED_Q) {
      return res.status(400).json({ success: false, message: "Course quiz is not ready" });
    }

    const safeQuestions = course.questions.map((q, idx) => ({
      index: idx,
      prompt: q.prompt,
      options: q.options,
    }));

    res.json({
      success: true,
      data: {
        id: course._id,
        courseCode: course.courseCode,
        name: course.name,
        imageUrl: course.imageUrl,
        passPercent: PASS_PERCENT,
        questions: safeQuestions,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/courses/admin/:id
exports.getCourseAdmin = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid course id" });
    }
    const course = await Course.findById(req.params.id).lean();
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// POST /api/courses/:id/submit
exports.submitQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid course id" });
    }

    const { answers } = req.body || {};
    if (!Array.isArray(answers) || answers.length !== REQUIRED_Q) {
      return res.status(400).json({
        success: false,
        message: `Submit an array "answers" of length ${REQUIRED_Q} (each 0–3)`,
      });
    }

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (!course.questions || course.questions.length !== REQUIRED_Q) {
      return res.status(400).json({ success: false, message: "Course quiz is not ready" });
    }

    let correct = 0;
    for (let i = 0; i < REQUIRED_Q; i++) {
      const n = Number(answers[i]);
      if (!Number.isInteger(n) || n < 0 || n > 3) {
        return res.status(400).json({
          success: false,
          message: `Invalid answer at index ${i}: must be 0–3`,
        });
      }
      if (n === course.questions[i].correctIndex) correct++;
    }

    const percent = Math.round((correct / REQUIRED_Q) * 1000) / 10;
    const passed = percent >= PASS_PERCENT;

    res.json({
      success: true,
      data: { correct, total: REQUIRED_Q, percent, passPercent: PASS_PERCENT, passed },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/courses
exports.createCourse = async (req, res, next) => {
  try {
    const { courseCode, name, imageUrl, description, questions } = req.body || {};

    if (!courseCode || !name) {
      return res.status(400).json({ success: false, message: "courseCode and name are required" });
    }

    const err = validateQuestionsPayload(questions);
    if (err) return res.status(400).json({ success: false, message: err });

    const exists = await Course.findOne({ courseCode: String(courseCode).trim().toUpperCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: "courseCode already exists" });
    }

    const saved = await Course.create({
      courseCode: String(courseCode).trim().toUpperCase(),
      name: String(name).trim(),
      imageUrl: imageUrl ? String(imageUrl).trim() : "",
      description: description != null ? String(description).trim() : "",
      questions: normalizeQuestions(questions),
    });

    res.status(201).json({ success: true, message: "Course created", data: saved });
  } catch (err) {
    next(err);
  }
};

// PUT /api/courses/:id
exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid course id" });
    }

    const { name, imageUrl, description, questions, courseCode } = req.body || {};
    const patch = {};

    if (name != null) patch.name = String(name).trim();
    if (imageUrl != null) patch.imageUrl = String(imageUrl).trim();
    if (description != null) patch.description = String(description).trim();
    if (courseCode != null) patch.courseCode = String(courseCode).trim().toUpperCase();

    if (questions !== undefined) {
      const err = validateQuestionsPayload(questions);
      if (err) return res.status(400).json({ success: false, message: err });
      patch.questions = normalizeQuestions(questions);
    }

    if (patch.courseCode) {
      const clash = await Course.findOne({ courseCode: patch.courseCode, _id: { $ne: id } });
      if (clash) {
        return res.status(400).json({ success: false, message: "courseCode already in use" });
      }
    }

    const updated = await Course.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: "Course not found" });

    res.json({ success: true, message: "Course updated", data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/courses/:id
exports.deleteCourse = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid course id" });
    }
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, message: "Course deleted", data: deleted });
  } catch (err) {
    next(err);
  }
};