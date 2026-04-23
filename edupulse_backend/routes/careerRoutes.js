const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const CareerRole = require("../models/CareerRole");
const Roadmap = require("../models/Roadmap");
const {
  getCareerRoles,
  getCareerRoadmapByRoleId,
  getRoadmapProgress,
  updateRoadmapProgress,
} = require("../controllers/careerController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCareerRoles);
router.get("/:id/roadmap", getCareerRoadmapByRoleId);
router.get("/:id/progress", getRoadmapProgress);
router.put("/:id/progress", updateRoadmapProgress);

module.exports = router;