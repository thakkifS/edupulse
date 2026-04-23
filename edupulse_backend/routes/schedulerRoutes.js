const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/schedulerController");

router.get("/check", ctrl.checkSchedule); // must be before /:id
router.get("/", ctrl.getAllSchedules);
router.get("/:id", ctrl.getScheduleById);
router.post("/", ctrl.createSchedule);
router.put("/:id", ctrl.updateSchedule);
router.delete("/:id", ctrl.deleteSchedule);

module.exports = router;