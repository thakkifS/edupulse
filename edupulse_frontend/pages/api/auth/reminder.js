import nodemailer from "nodemailer";

const EMAIL_USER = process.env.REMINDER_EMAIL_USER;
const EMAIL_PASS = process.env.REMINDER_EMAIL_PASS;

const SUBJECT_MAP = {
  signin: "EduPulse Sign In Reminder",
  signup: "EduPulse Welcome Reminder",
  forgot: "EduPulse Forgot Password Reminder",
};

const MESSAGE_MAP = {
  signin: "You have signed in to EduPulse successfully.",
  signup: "Your EduPulse account has been created successfully.",
  forgot: "We received a forgot password request for your EduPulse account.",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { to, type } = req.body || {};
  if (!to || !type || !SUBJECT_MAP[type]) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  try {
    if (!EMAIL_USER || !EMAIL_PASS) {
      return res.status(500).json({
        message:
          "Reminder email is not configured. Set REMINDER_EMAIL_USER and REMINDER_EMAIL_PASS in your environment.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: EMAIL_USER,
      to,
      subject: SUBJECT_MAP[type],
      text: MESSAGE_MAP[type],
      html: `<p>${MESSAGE_MAP[type]}</p><p>Thank you,<br/>EduPulse Team</p>`,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Reminder mail failed:", error);
    return res.status(500).json({ message: "Failed to send reminder" });
  }
}
