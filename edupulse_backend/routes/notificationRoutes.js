const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/notificationController");

router.post("/reminder", ctrl.sendReminder);

module.exports = router;