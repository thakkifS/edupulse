const ResumeScore = require("../models/ResumeScore");

const createResumeScore = async (req, res, next) => {
  try {
    const { cvId, targetRoleId } = req.body;
    
    if (!cvId || !targetRoleId) {
      return res.status(400).json({ 
        success: false, 
        message: "cvId and targetRoleId are required" 
      });
    }

    // Simple scoring algorithm (in real app, this would be more sophisticated)
    const score = Math.floor(Math.random() * 30) + 70; // Score between 70-100
    const suggestions = [
      "Consider adding more specific technical skills",
      "Highlight your achievements with metrics",
      "Add more relevant project experience",
      "Include certifications and training"
    ];

    const resumeScore = await ResumeScore.create({
      userId: req.user.id,
      cvId,
      targetRoleId,
      score,
      suggestions,
      feedback: `Your resume scores ${score}/100. Consider the following improvements: ${suggestions.join(', ')}`
    });

    res.status(201).json({ 
      success: true, 
      message: "Resume scored successfully", 
      data: resumeScore 
    });
  } catch (error) {
    next(error);
  }
};

const getResumeScoreHistory = async (req, res, next) => {
  try {
    const scores = await ResumeScore.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.status(200).json({ 
      success: true, 
      count: scores.length, 
      data: scores 
    });
  } catch (error) {
    next(error);
  }
};

const deleteResumeScore = async (req, res, next) => {
  try {
    const score = await ResumeScore.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!score) {
      return res.status(404).json({ 
        success: false, 
        message: "Resume score not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Resume score deleted successfully" 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  createResumeScore, 
  getResumeScoreHistory, 
  deleteResumeScore 
};