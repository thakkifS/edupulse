const { sendMail } = require("../utils/mailer");

// POST /api/notifications/reminder
exports.sendReminder = async (req, res, next) => {
  try {
    const { toEmail, subject, message } = req.body;

    if (!toEmail || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "toEmail, subject, and message are required",
      });
    }

    await sendMail({ to: toEmail, subject, text: message });

    res.json({ success: true, message: "Reminder email sent" });
  } catch (err) {
    if (err.code === "EMAIL_NOT_CONFIGURED") {
      return res.status(500).json({ success: false, message: err.message });
    }
    next(err);
  }
};