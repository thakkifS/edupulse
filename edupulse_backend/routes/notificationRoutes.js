const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

const EMAIL_USER = process.env.REMINDER_EMAIL_USER;
const EMAIL_PASS = process.env.REMINDER_EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: EMAIL_USER && EMAIL_PASS ? { user: EMAIL_USER, pass: EMAIL_PASS } : undefined,
});

router.post("/reminder", async (req, res) => {
  try {
    if (!EMAIL_USER || !EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email is not configured. Set REMINDER_EMAIL_USER and REMINDER_EMAIL_PASS.",
      });
    }

    const { toEmail, subject, message } = req.body;
    if (!toEmail || !subject || !message) {
      return res.status(400).json({ success: false, message: "toEmail, subject, and message are required" });
    }

    await transporter.sendMail({
      from: EMAIL_USER,
      to: toEmail,
      subject,
      text: message,
    });

    res.json({ success: true, message: "Reminder email sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
