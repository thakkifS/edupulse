const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbacks.controller");

// Feedback CRUD routes
router.get("/", feedbackController.listFeedbacks);
router.post("/", feedbackController.createFeedback);
router.put("/:id", feedbackController.updateFeedback);
router.delete("/:id", feedbackController.deleteFeedback);

module.exports = router;
