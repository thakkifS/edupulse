const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/chatController");

router.get("/history", ctrl.getChatHistory);
router.get("/rooms", ctrl.getChatRooms);

module.exports = router;