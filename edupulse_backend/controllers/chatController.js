const ChatMessage = require("../models/ChatMessage");
const { normalizeRoomKey } = require("../Utils/roomKey");

// GET /api/chat/history?roomKey=
exports.getChatHistory = async (req, res, next) => {
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
    next(err);
  }
};

// GET /api/chat/rooms  (admin: all threads with last message)
exports.getChatRooms = async (req, res, next) => {
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
    next(err);
  }
};