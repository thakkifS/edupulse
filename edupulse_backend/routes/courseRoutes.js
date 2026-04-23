const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/courseController");

// Named sub-routes must come before dynamic /:id routes
router.get("/search/:query", ctrl.searchCourses);
router.get("/quiz/:id", ctrl.getCourseQuiz);
router.get("/admin/:id", ctrl.getCourseAdmin);
router.post("/:id/submit", ctrl.submitQuiz);

router.get("/", ctrl.getAllCourses);
router.post("/", ctrl.createCourse);
router.put("/:id", ctrl.updateCourse);
router.delete("/:id", ctrl.deleteCourse);

module.exports = router;