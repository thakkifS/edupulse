const express = require("express");
const ChatMessage = require("../models/ChatMessage");

const router = express.Router();

function normalizeRoomKey(email) {
  return String(email || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._-]+/g, "_")
    .slice(0, 120);
}

// History for a room (student thread) — survives refresh
router.get("/history", async (req, res) => {
  try {
    const roomKey = normalizeRoomKey(req.query.roomKey || req.query.room || "");
    if (!roomKey) {
      return res.status(400).json({ success: false, message: "roomKey required" });
    }
    const limit = Math.min(Number(req.query.limit) || 80, 200);
    const items = await ChatMessage.find({ roomKey })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: all conversation threads with last message
router.get("/rooms", async (req, res) => {
  try {
    const rows = await ChatMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$roomKey",
          lastMessage: { $first: "$$ROOT" },
          unreadHint: { $sum: 1 },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
      { $limit: 200 },
    ]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = { router, normalizeRoomKey };
