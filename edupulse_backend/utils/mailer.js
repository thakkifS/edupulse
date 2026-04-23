const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.REMINDER_EMAIL_USER;
const EMAIL_PASS = process.env.REMINDER_EMAIL_PASS;

let transporter = null;

const getTransporter = () => {
  if (!EMAIL_USER || !EMAIL_PASS) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return transporter;
};

const sendMail = async ({ to, subject, text, html }) => {
  const t = getTransporter();
  if (!t) {
    const err = new Error(
      "Email not configured. Set REMINDER_EMAIL_USER and REMINDER_EMAIL_PASS."
    );
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }
  await t.sendMail({ from: EMAIL_USER, to, subject, text, html });
};

module.exports = { sendMail };