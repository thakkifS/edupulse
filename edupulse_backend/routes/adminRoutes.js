const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const ctrl = require("../controllers/adminController");

router.use(authMiddleware, roleMiddleware("admin"));

// CV Templates
router.get("/cv-templates", ctrl.getCvTemplatesAdmin);
router.post("/cv-templates", ctrl.createCvTemplate);
router.put("/cv-templates/:id", ctrl.updateCvTemplate);
router.delete("/cv-templates/:id", ctrl.deleteCvTemplate);

// Career Roles
router.get("/careers", ctrl.getCareerRolesAdmin);
router.post("/careers", ctrl.createCareerRole);
router.put("/careers/:id", ctrl.updateCareerRole);
router.delete("/careers/:id", ctrl.deleteCareerRole);

// Roadmaps
router.get("/roadmaps", ctrl.getRoadmapsAdmin);
router.post("/roadmaps", ctrl.createRoadmap);
router.put("/roadmaps/:id", ctrl.updateRoadmap);
router.delete("/roadmaps/:id", ctrl.deleteRoadmap);

// Job Roles
router.get("/job-roles", ctrl.getJobRolesAdmin);
router.post("/job-roles", ctrl.createJobRole);
router.put("/job-roles/:id", ctrl.updateJobRole);
router.delete("/job-roles/:id", ctrl.deleteJobRole);

module.exports = router;