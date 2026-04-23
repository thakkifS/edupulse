const cron = require("node-cron");
const Scheduler = require("../models/Scheduler");
const { sendMail } = require("../utils/mailer");

const initCronJobs = () => {
  // Runs every day at 07:00 — sends reminders for events happening today
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
          .map(
            (ev) =>
              `- ${ev.eventType}: ${ev.moduleName || "General"} at ${ev.time || "Time"} (${ev.description || ""})`
          )
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

  console.log("✅ Cron jobs initialized");
};

module.exports = initCronJobs;