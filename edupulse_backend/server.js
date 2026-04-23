require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");

const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const initCronJobs = require("./config/cron");

const bookRoutes = require("./routes/bookRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const schedulerRoutes = require("./routes/schedulerRoutes");
const courseRoutes = require("./routes/courseRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const cvRoutes = require("./routes/cvRoutes");
const skillRoutes = require("./routes/skillRoutes");
const careerRoutes = require("./routes/careerRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const jobRoutes = require("./routes/jobRoutes");
const adminRoutes = require("./routes/adminRoutes");

// New feature routes
const assignmentRoutes = require("./routes/assignmentRoutes");
const eventRoutes = require("./routes/eventRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const quizRoutes = require("./routes/quizRoutes");

const validateJSON = require("./middlewares/validateJSON");
const errorHandler = require("./middlewares/errorHandler");

// ── App ──────────────────────────────────────────────────────────────────────
const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ── Body Parser ───────────────────────────────────────────────────────────────
app.use(bodyParser.json({ limit: "10mb", verify: validateJSON }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("EduPulse API is running ✅"));

app.use("/api/Book", bookRoutes);
app.use("/api/Register", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/scheduler", schedulerRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/cv", cvRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/admin", adminRoutes);

// New feature routes
app.use("/api/assignments", assignmentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/quizzes", quizRoutes);

// ── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ── HTTP + Socket.IO ──────────────────────────────────────────────────────────
const server = http.createServer(app);
initSocket(server);

// ── Database ──────────────────────────────────────────────────────────────────
connectDB();

// ── Cron Jobs ─────────────────────────────────────────────────────────────────
initCronJobs();

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));