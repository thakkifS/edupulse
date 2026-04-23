const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} = require("../controllers/skillController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getSkills);
router.post("/", createSkill);
router.put("/:id", updateSkill);
router.delete("/:id", deleteSkill);

module.exports = router;