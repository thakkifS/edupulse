const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createResumeScore,
  getResumeScoreHistory,
  deleteResumeScore,
} = require("../controllers/resumeController");

const router = express.Router();

// Temporarily comment out routes to debug
// router.post("/score", authMiddleware, createResumeScore);
// router.get("/scores/history", authMiddleware, getResumeScoreHistory);
// router.delete("/scores/:id", authMiddleware, deleteResumeScore);

module.exports = router;