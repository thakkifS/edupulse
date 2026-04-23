export const RoadmapStepTypes = {
  SKILL: "Skill",
  PROJECT: "Project",
  CERTIFICATION: "Certification",
  INTERNSHIP: "Internship",
};

export const createRoadmapStep = (id, title, description, type) => ({
  id,
  title,
  description,
  type,
  completed: false,
});
