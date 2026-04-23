const Skill = require("../models/Skill");

const getSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ userId: req.user.id }).sort({ updatedAt: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: skills.length, data: skills });
  } catch (error) {
    next(error);
  }
};

const createSkill = async (req, res, next) => {
  try {
    const { skillName, level } = req.body;
    if (!skillName || !skillName.trim()) {
      return res.status(400).json({ success: false, message: "skillName is required" });
    }
    const normalized = skillName.trim();
    const existing = await Skill.findOne({
      userId: req.user.id,
      skillName: { $regex: new RegExp(`^${normalized}$`, "i") },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "Skill already exists for this user" });
    }
    const skill = await Skill.create({ userId: req.user.id, skillName: normalized, level: level || "beginner" });
    res.status(201).json({ success: true, message: "Skill created successfully", data: skill });
  } catch (error) {
    next(error);
  }
};

const updateSkill = async (req, res, next) => {
  try {
    const { skillName, level } = req.body;
    const skill = await Skill.findOne({ _id: req.params.id, userId: req.user.id });
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }
    if (skillName !== undefined) {
      if (!skillName.trim()) {
        return res.status(400).json({ success: false, message: "skillName cannot be empty" });
      }
      const normalized = skillName.trim();
      const duplicate = await Skill.findOne({
        _id: { $ne: skill._id },
        userId: req.user.id,
        skillName: { $regex: new RegExp(`^${normalized}$`, "i") },
      });
      if (duplicate) {
        return res.status(409).json({ success: false, message: "Another skill with this name already exists" });
      }
      skill.skillName = normalized;
    }
    if (level !== undefined) skill.level = level;
    await skill.save();
    res.status(200).json({ success: true, message: "Skill updated successfully", data: skill });
  } catch (error) {
    next(error);
  }
};

const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }
    res.status(200).json({ success: true, message: "Skill deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSkills, createSkill, updateSkill, deleteSkill };