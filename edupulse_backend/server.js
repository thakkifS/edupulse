const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const cron = require("node-cron");

const booksRoutes = require('./routes/Books');
const schedulerRoutes = require('./routes/schedulerRoutes');
const registerRoutes = require("./routes/registerRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const usersRoutes = require("./routes/usersRoutes");
const courseRoutes = require("./routes/courseRoutes");
const Scheduler = require("./models/Scheduler");
const { sendMail } = require("./utils/mailer");

const app = express();

// ----------------- CORS -----------------
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// ----------------- Body Parser -----------------
app.use(bodyParser.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'Invalid JSON format in request body',
        error: e.message
      });
      throw new Error('Invalid JSON');
    }
  }
}));

// Body-parser error handling
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format',
      error: 'Please check your JSON syntax. Make sure all quotes are properly closed and there are no trailing commas.'
    });
  }
  next();
});

// ----------------- MongoDB Connection -----------------
mongoose.connect('mongodb://localhost:27017/edupulse')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Error:', err));

// ----------------- Routes -----------------
app.use('/api/Book', booksRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use("/api/Register", registerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/courses", courseRoutes);

app.get('/', (req, res) => res.send("Hello World"));

// ----------------- Socket.IO -----------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

// ----------------- Start Server -----------------
const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`Server running on port ${port}`));

// ----------------- Daily Reminder Job -----------------
// Runs every day at 07:00 server time. Sends reminders for events happening "today".
cron.schedule("0 7 * * *", async () => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const schedules = await Scheduler.find({ "events.0": { $exists: true } });
    for (const s of schedules) {
      const todays = (s.events || []).filter((ev) => {
        const d = new Date(ev.date);
        return d >= start && d < end;
      });
      if (todays.length === 0) continue;

      const lines = todays
        .map((ev) => `- ${ev.eventType}: ${ev.moduleName || "General"} at ${ev.time || "Time"} (${ev.description || ""})`)
        .join("\n");

      await sendMail({
        to: s.email,
        subject: "EduPulse Reminder: Today's Events",
        text: `Hi ${s.studentName},\n\nHere are your events for today:\n${lines}\n\nEduPulse`,
        html: `<p>Hi <b>${s.studentName}</b>,</p><p>Here are your events for today:</p><pre>${lines}</pre><p>EduPulse</p>`,
      });
    }
  } catch (err) {
    console.error("Reminder cron failed:", err.message);
  }
});