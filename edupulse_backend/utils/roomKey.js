/**
 * Normalizes an email/room string into a safe Socket.IO room key.
 */
const normalizeRoomKey = (email) =>
  String(email || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._-]+/g, "_")
    .slice(0, 120);

module.exports = { normalizeRoomKey };
