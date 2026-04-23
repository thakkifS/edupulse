const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getJobSuggestions,
} = require("../controllers/jobController");

const router = express.Router();

router.use(authMiddleware);

router.get("/suggestions", getJobSuggestions);

module.exports = router;