const clamp15 = (n) => Math.max(1, Math.min(5, Number(n || 0)));

export const INTEREST_ITEMS = [
  { key: "logic", label: "I enjoy solving logical or mathematical problems" },
  { key: "code", label: "I like writing code or scripts" },
  { key: "data", label: "I enjoy analyzing data and finding patterns" },
  { key: "security", label: "I am interested in cybersecurity and hacking concepts" },
  { key: "uiux", label: "I enjoy designing user-friendly interfaces" },
  { key: "systems", label: "I like managing systems, servers, or networks" },
  { key: "qa", label: "I enjoy testing software to find errors" },
  { key: "support", label: "I like helping people solve technical problems" },
];

export const SKILL_ITEMS = [
  { key: "programming", label: "Programming (Java, Python, C#, etc.)" },
  { key: "web", label: "Web development (HTML, CSS, JS)" },
  { key: "sql", label: "Databases / SQL" },
  { key: "analysis", label: "Data analysis / Excel / Power BI" },
  { key: "networking", label: "Networking basics" },
  { key: "linux", label: "Linux / OS management" },
  { key: "cloud", label: "Cloud platforms (AWS, Azure)" },
];

const CAREERS = [
  {
    id: "software-dev",
    name: "Software Developer",
    image: "/career1.png",
    weights: { logic: 1.2, code: 1.4, programming: 1.4, qa: 0.4, systems: 0.4 },
    bonuses: { workType: { logical: 2 }, learn: { yes: 2, maybe: 1 } },
  },
  {
    id: "web-dev",
    name: "Web Developer",
    image: "/career2.png",
    weights: { code: 1.2, uiux: 1.0, web: 1.6, programming: 0.8, qa: 0.5 },
    bonuses: { workType: { creative: 2 }, learn: { yes: 2, maybe: 1 } },
  },
  {
    id: "mobile-dev",
    name: "Mobile App Developer",
    image: "/career3.png",
    weights: { code: 1.3, programming: 1.3, uiux: 0.8, logic: 0.8, qa: 0.4 },
    bonuses: { workType: { creative: 1, logical: 1 }, learn: { yes: 2, maybe: 1 } },
  },
  {
    id: "data",
    name: "Data Analyst / Data Scientist",
    image: "/career4.png",
    weights: { data: 1.6, logic: 1.1, analysis: 1.6, sql: 1.0, programming: 0.6 },
    bonuses: { workType: { analytical: 2 }, learn: { yes: 2, maybe: 1 } },
  },
  {
    id: "ai-ml",
    name: "AI / Machine Learning Engineer",
    image: "/career5.png",
    weights: { logic: 1.5, data: 1.4, programming: 1.5, analysis: 1.1, sql: 0.4 },
    bonuses: { workType: { analytical: 2, logical: 1 }, learn: { yes: 3, maybe: 1 } },
  },
  {
    id: "cyber",
    name: "Cybersecurity Analyst",
    image: "/career6.png",
    weights: { security: 1.8, systems: 1.0, networking: 1.2, linux: 1.0, logic: 0.6 },
    bonuses: { workType: { investigative: 2 }, pressure: { very: 1 } },
  },
  {
    id: "cloud-devops",
    name: "Cloud / DevOps Engineer",
    image: "/career7.png",
    weights: { systems: 1.5, cloud: 1.6, linux: 1.2, networking: 1.0, code: 0.6 },
    bonuses: { workType: { practical: 2 }, pressure: { very: 1, moderate: 0.5 } },
  },
  {
    id: "network",
    name: "Network Engineer",
    image: "/career8.png",
    weights: { networking: 1.8, systems: 1.0, linux: 0.8, support: 0.4 },
    bonuses: { workType: { practical: 2 }, pressure: { very: 1 } },
  },
  {
    id: "uiux",
    name: "UI/UX Designer",
    image: "/career9.png",
    weights: { uiux: 1.8, creativeBias: 0.0, web: 0.8, code: 0.4 },
    bonuses: { workType: { creative: 3 }, team: { team: 1 } },
  },
  {
    id: "qa",
    name: "QA / Software Tester",
    image: "/career10.png",
    weights: { qa: 1.8, logic: 0.8, code: 0.6, programming: 0.6 },
    bonuses: { workType: { logical: 1, analytical: 1 }, pressure: { very: 1 } },
  },
  {
    id: "it-support",
    name: "IT Support / System Administrator",
    image: "/career11.png",
    weights: { support: 1.8, systems: 1.2, linux: 0.8, networking: 0.8 },
    bonuses: { team: { team: 1, lead: 0.5 }, pressure: { very: 1, moderate: 0.5 } },
  },
];

export function scoreSurvey(form) {
  const interest = form?.interest || {};
  const skills = form?.skills || {};

  const prefs = form?.prefs || {};
  const motivation = form?.motivation || {};

  const workType = prefs.workType; // logical | creative | analytical | investigative | practical
  const team = prefs.team; // independent | team | lead
  const pressure = prefs.pressure; // very | moderate | poorly
  const learn = motivation.learn; // yes | maybe | no

  const base = {};

  for (const c of CAREERS) {
    let score = 0;
    for (const item of INTEREST_ITEMS) {
      const w = c.weights[item.key] || 0;
      score += w * clamp15(interest[item.key]);
    }
    for (const item of SKILL_ITEMS) {
      const w = c.weights[item.key] || 0;
      score += w * clamp15(skills[item.key]);
    }

    if (c.bonuses?.workType?.[workType]) score += c.bonuses.workType[workType];
    if (c.bonuses?.team?.[team]) score += c.bonuses.team[team];
    if (c.bonuses?.pressure?.[pressure]) score += c.bonuses.pressure[pressure];
    if (c.bonuses?.learn?.[learn]) score += c.bonuses.learn[learn];

    base[c.id] = score;
  }

  const sorted = [...CAREERS]
    .map((c) => ({ ...c, score: Number(base[c.id] || 0) }))
    .sort((a, b) => b.score - a.score);

  return {
    top3: sorted.slice(0, 3),
    all: sorted,
  };
}

