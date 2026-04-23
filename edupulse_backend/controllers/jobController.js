const { getJobSuggestionsForUser } = require("../services/jobMatchService");

const getJobSuggestions = async (req, res, next) => {
  try {
    const { targetCareer } = req.query;
    const suggestions = await getJobSuggestionsForUser({ userId: req.user.id, targetCareer });
    res.status(200).json({ success: true, count: suggestions.length, data: suggestions });
  } catch (error) {
    next(error);
  }
};

module.exports = { getJobSuggestions };