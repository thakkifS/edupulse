const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizzes.controller");

// Quiz CRUD routes
router.get("/", quizController.listQuizzes);
router.post("/", quizController.createQuiz);
router.get("/:id", quizController.getQuizById);
router.put("/:id", quizController.updateQuiz);
router.delete("/:id", quizController.deleteQuiz);

// Quiz management routes
router.post("/:id/publish", quizController.publishQuiz);

// Quiz attempt routes (for students)
router.post("/:id/attempts/start", quizController.startQuizAttempt);
router.post("/:id/attempts/:attemptId/submit", quizController.submitQuizAttempt);

// Quiz review/grading routes (for tutors/admins)
router.get("/:id/attempts", quizController.getQuizAttemptsOverview);
router.post("/:id/attempts/:attemptId/review", quizController.reviewQuizAttempt);

module.exports = router;
