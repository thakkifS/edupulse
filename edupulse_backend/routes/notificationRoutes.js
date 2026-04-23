const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/notificationController");

// Reminder functionality (existing)
router.post("/reminder", ctrl.sendReminder);

// Notification management routes
router.get("/", ctrl.listMyNotifications);
router.get("/unread-count", ctrl.getUnreadCount);
router.patch("/:id/read", ctrl.markAsRead);
router.patch("/read-all", ctrl.markAllAsRead);
router.get("/:id/event", ctrl.getNotificationEvent);

module.exports = router;