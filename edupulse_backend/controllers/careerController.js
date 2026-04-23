const CareerRole = require("../models/CareerRole");
const Roadmap = require("../models/Roadmap");

const getCareerRoles = async (req, res, next) => {
  try {
    const roles = await CareerRole.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: roles.length, data: roles });
  } catch (error) {
    next(error);
  }
};

const getCareerRoadmapByRoleId = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ careerRoleId: req.params.id });
    
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }

    res.status(200).json({ success: true, data: roadmap });
  } catch (error) {
    next(error);
  }
};

const getRoadmapProgress = async (req, res, next) => {
  try {
    const { roadmapId } = req.query;
    const userId = req.user.id;
    
    // This would typically track user progress through a separate model
    // For now, return a placeholder response
    res.status(200).json({ 
      success: true, 
      data: { 
        roadmapId, 
        userId, 
        completedSteps: [], 
        totalSteps: 0,
        progressPercentage: 0 
      } 
    });
  } catch (error) {
    next(error);
  }
};

const updateRoadmapProgress = async (req, res, next) => {
  try {
    const { roadmapId, completedStepIndexes } = req.body;
    const userId = req.user.id;
    
    // This would update user progress in a separate model
    // For now, return a placeholder response
    res.status(200).json({ 
      success: true, 
      message: "Roadmap progress updated successfully",
      data: { 
        roadmapId, 
        userId, 
        completedStepIndexes 
      } 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCareerRoles,
  getCareerRoadmapByRoleId,
  getRoadmapProgress,
  updateRoadmapProgress
};