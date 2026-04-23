const CvTemplate = require("../models/CvTemplate");
const CareerRole = require("../models/CareerRole");
const Roadmap = require("../models/Roadmap");
const JobRole = require("../models/JobRole");

const getCvTemplatesAdmin = async (req, res, next) => {
  try {
    const templates = await CvTemplate.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: templates.length, data: templates });
  } catch (error) {
    next(error);
  }
};

const createCvTemplate = async (req, res, next) => {
  try {
    const { name, description, previewImageUrl, htmlTemplate, category } = req.body;
    
    const template = await CvTemplate.create({
      name,
      description,
      previewImageUrl,
      htmlTemplate,
      category: category || "professional"
    });

    res.status(201).json({ success: true, message: "CV template created successfully", data: template });
  } catch (error) {
    next(error);
  }
};

const updateCvTemplate = async (req, res, next) => {
  try {
    const template = await CvTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!template) {
      return res.status(404).json({ success: false, message: "CV template not found" });
    }

    res.status(200).json({ success: true, message: "CV template updated successfully", data: template });
  } catch (error) {
    next(error);
  }
};

const deleteCvTemplate = async (req, res, next) => {
  try {
    const template = await CvTemplate.findByIdAndDelete(req.params.id);
    
    if (!template) {
      return res.status(404).json({ success: false, message: "CV template not found" });
    }

    res.status(200).json({ success: true, message: "CV template deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getCareerRolesAdmin = async (req, res, next) => {
  try {
    const roles = await CareerRole.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: roles.length, data: roles });
  } catch (error) {
    next(error);
  }
};

const createCareerRole = async (req, res, next) => {
  try {
    const role = await CareerRole.create(req.body);
    res.status(201).json({ success: true, message: "Career role created successfully", data: role });
  } catch (error) {
    next(error);
  }
};

const updateCareerRole = async (req, res, next) => {
  try {
    const role = await CareerRole.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!role) {
      return res.status(404).json({ success: false, message: "Career role not found" });
    }

    res.status(200).json({ success: true, message: "Career role updated successfully", data: role });
  } catch (error) {
    next(error);
  }
};

const deleteCareerRole = async (req, res, next) => {
  try {
    const role = await CareerRole.findByIdAndDelete(req.params.id);
    
    if (!role) {
      return res.status(404).json({ success: false, message: "Career role not found" });
    }

    res.status(200).json({ success: true, message: "Career role deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getRoadmapsAdmin = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: roadmaps.length, data: roadmaps });
  } catch (error) {
    next(error);
  }
};

const createRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.create(req.body);
    res.status(201).json({ success: true, message: "Roadmap created successfully", data: roadmap });
  } catch (error) {
    next(error);
  }
};

const updateRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }

    res.status(200).json({ success: true, message: "Roadmap updated successfully", data: roadmap });
  } catch (error) {
    next(error);
  }
};

const deleteRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findByIdAndDelete(req.params.id);
    
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }

    res.status(200).json({ success: true, message: "Roadmap deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getJobRolesAdmin = async (req, res, next) => {
  try {
    const jobRoles = await JobRole.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: jobRoles.length, data: jobRoles });
  } catch (error) {
    next(error);
  }
};

const createJobRole = async (req, res, next) => {
  try {
    const jobRole = await JobRole.create(req.body);
    res.status(201).json({ success: true, message: "Job role created successfully", data: jobRole });
  } catch (error) {
    next(error);
  }
};

const updateJobRole = async (req, res, next) => {
  try {
    const jobRole = await JobRole.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!jobRole) {
      return res.status(404).json({ success: false, message: "Job role not found" });
    }

    res.status(200).json({ success: true, message: "Job role updated successfully", data: jobRole });
  } catch (error) {
    next(error);
  }
};

const deleteJobRole = async (req, res, next) => {
  try {
    const jobRole = await JobRole.findByIdAndDelete(req.params.id);
    
    if (!jobRole) {
      return res.status(404).json({ success: false, message: "Job role not found" });
    }

    res.status(200).json({ success: true, message: "Job role deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCvTemplatesAdmin,
  createCvTemplate,
  updateCvTemplate,
  deleteCvTemplate,
  getCareerRolesAdmin,
  createCareerRole,
  updateCareerRole,
  deleteCareerRole,
  getRoadmapsAdmin,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  getJobRolesAdmin,
  createJobRole,
  updateJobRole,
  deleteJobRole
};