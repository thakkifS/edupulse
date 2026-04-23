const getJobSuggestionsForUser = async ({ userId, targetCareer }) => {
  // Sample job suggestions based on career
  const sampleJobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "TechCorp Solutions",
      location: "San Francisco, CA",
      type: "Full-time",
      remote: true,
      experience: "Mid-level",
      salary: "$90,000 - $130,000",
      description: "We are looking for an experienced Frontend Developer...",
      requirements: ["React", "TypeScript", "CSS", "JavaScript"],
      posted: "2 days ago",
      careerId: "web-dev"
    },
    {
      id: 2,
      title: "Data Scientist",
      company: "DataDriven Analytics",
      location: "New York, NY",
      type: "Full-time",
      remote: false,
      experience: "Senior-level",
      salary: "$120,000 - $160,000",
      description: "Join our data science team to work on cutting-edge ML projects...",
      requirements: ["Python", "Machine Learning", "SQL", "Statistics"],
      posted: "1 week ago",
      careerId: "data"
    }
  ];

  let filteredJobs = sampleJobs;
  
  if (targetCareer) {
    filteredJobs = sampleJobs.filter(job => job.careerId === targetCareer);
  }

  return filteredJobs;
};

module.exports = { getJobSuggestionsForUser };