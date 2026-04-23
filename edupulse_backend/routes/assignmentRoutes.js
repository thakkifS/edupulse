const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignments.controller");

// Assignment CRUD routes
router.get("/", assignmentController.listAssignments);
router.post("/", assignmentController.createAssignment);
router.get("/:id", assignmentController.getAssignmentById);
router.put("/:id", assignmentController.updateAssignment);
router.delete("/:id", assignmentController.deleteAssignment);

// Assignment management routes
router.post("/:id/publish", assignmentController.publishAssignment);
router.post("/:id/close", assignmentController.closeAssignment);

// Assignment submission routes
router.post("/:id/submit", assignmentController.submitAssignment);

// Assignment review/grading routes (for tutors/admins)
router.get("/:id/submissions", assignmentController.getAssignmentSubmissionsOverview);
router.post("/:id/submissions/:submissionId/review", assignmentController.reviewAssignmentSubmission);

module.exports = router;
