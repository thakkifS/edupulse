const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/modules.controller");

// Module CRUD routes
router.get("/", moduleController.listModules);
router.post("/", moduleController.createModule);
router.get("/:id", moduleController.getModuleById);
router.put("/:id", moduleController.updateModule);
router.delete("/:id", moduleController.deleteModule);

// Module results routes
router.get("/:id/results", moduleController.listModuleResults);
router.post("/:id/results/calculate", moduleController.calculateModuleResults);
router.post("/:id/results/publish", moduleController.publishModuleResults);

// Student's own module results
router.get("/my/results", moduleController.listMyModuleResults);

module.exports = router;
