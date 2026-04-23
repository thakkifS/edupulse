require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const CvTemplate = require("../models/CvTemplate");
const CareerRole = require("../models/CareerRole");
const CareerRoadmap = require("../models/CareerRoadmap");
const JobRole = require("../models/JobRole");

const seedData = async () => {
  try {
    await connectDB();

    console.log("Clearing old seed data...");

    await CvTemplate.deleteMany({});
    await CareerRoadmap.deleteMany({});
    await CareerRole.deleteMany({});
    await JobRole.deleteMany({});

    console.log("Inserting CV templates...");

    const templates = await CvTemplate.insertMany([
      {
        name: "Classic",
        isActive: true,
        previewImageUrl: "",
        layoutConfig: { columns: 1 },
        htmlTemplate: `
          <html>
            <body>
              <h1>{{fullName}}</h1>
              <p>{{email}}</p>
              <p>{{phone}}</p>
              <p>{{location}}</p>
              <h2>Summary</h2>
              <p>{{summary}}</p>
            </body>
          </html>
        `,
      },
      {
        name: "Modern",
        isActive: true,
        previewImageUrl: "",
        layoutConfig: { columns: 2, sidebar: true },
        htmlTemplate: `
          <html>
            <body>
              <div style="display:flex;">
                <div style="width:30%;background:#eaf3ff;padding:20px;">
                  <h1>{{fullName}}</h1>
                  <p>{{email}}</p>
                  <p>{{phone}}</p>
                  <p>{{location}}</p>
                </div>
                <div style="width:70%;padding:20px;">
                  <h2>Summary</h2>
                  <p>{{summary}}</p>
                </div>
              </div>
            </body>
          </html>
        `,
      },
      {
        name: "Minimal",
        isActive: true,
        previewImageUrl: "",
        layoutConfig: { columns: 1, compact: true },
        htmlTemplate: `
          <html>
            <body>
              <div style="padding:24px;font-family:Arial,sans-serif;">
                <h1>{{fullName}}</h1>
                <p>{{email}} | {{phone}} | {{location}}</p>
                <hr />
                <h2>Summary</h2>
                <p>{{summary}}</p>
              </div>
            </body>
          </html>
        `,
      },
      {
        name: "Professional",
        isActive: true,
        previewImageUrl: "",
        layoutConfig: { columns: 2, emphasis: "header" },
        htmlTemplate: `
          <html>
            <body>
              <div style="padding:30px;font-family:Arial,sans-serif;">
                <div style="border-bottom:2px solid #1f2937;padding-bottom:12px;margin-bottom:20px;">
                  <h1 style="margin:0;">{{fullName}}</h1>
                  <p style="margin:6px 0 0 0;">{{email}} | {{phone}} | {{location}}</p>
                </div>
                <h2>Professional Summary</h2>
                <p>{{summary}}</p>
              </div>
            </body>
          </html>
        `,
      },
    ]);

    console.log("Inserting career roles...");

    const careers = await CareerRole.insertMany([
      {
        title: "Frontend Developer",
        description:
          "Builds responsive and interactive user interfaces for web applications.",
      },
      {
        title: "Backend Developer",
        description:
          "Builds APIs, databases, and server-side logic for applications.",
      },
      {
        title: "Full Stack Developer",
        description:
          "Works on both frontend and backend parts of web applications.",
      },
    ]);

    const frontendCareer = careers.find(
      (c) => c.title === "Frontend Developer"
    );
    const backendCareer = careers.find((c) => c.title === "Backend Developer");
    const fullstackCareer = careers.find(
      (c) => c.title === "Full Stack Developer"
    );

    console.log("Inserting roadmaps...");

    await CareerRoadmap.insertMany([
      {
        careerRoleId: frontendCareer._id,
        steps: [
          {
            title: "Learn HTML, CSS, and JavaScript",
            skills: ["HTML", "CSS", "JavaScript"],
            certifications: [],
            projects: ["Personal portfolio website"],
            resources: ["MDN Web Docs", "freeCodeCamp"],
          },
          {
            title: "Learn React and Next.js",
            skills: ["React", "Next.js"],
            certifications: [],
            projects: ["Student dashboard"],
            resources: ["React Docs", "Next.js Docs"],
          },
          {
            title: "Build real frontend projects",
            skills: ["Responsive Design", "API Integration"],
            certifications: [],
            projects: ["Career management frontend"],
            resources: ["Frontend Mentor", "YouTube tutorials"],
          },
        ],
      },
      {
        careerRoleId: backendCareer._id,
        steps: [
          {
            title: "Learn Node.js and Express",
            skills: ["Node.js", "Express"],
            certifications: [],
            projects: ["Basic REST API"],
            resources: ["Node.js Docs", "Express Docs"],
          },
          {
            title: "Learn MongoDB and Mongoose",
            skills: ["MongoDB", "Mongoose"],
            certifications: [],
            projects: ["CRUD backend project"],
            resources: ["MongoDB University", "Mongoose Docs"],
          },
          {
            title: "Build secure APIs",
            skills: ["JWT", "Role-based Access"],
            certifications: [],
            projects: ["Authentication system"],
            resources: ["OWASP", "Express security guides"],
          },
        ],
      },
      {
        careerRoleId: fullstackCareer._id,
        steps: [
          {
            title: "Master frontend fundamentals",
            skills: ["HTML", "CSS", "JavaScript", "React"],
            certifications: [],
            projects: ["Interactive UI project"],
            resources: ["MDN", "React Docs"],
          },
          {
            title: "Master backend development",
            skills: ["Node.js", "Express", "MongoDB"],
            certifications: [],
            projects: ["Full CRUD API"],
            resources: ["MongoDB Docs", "Express Docs"],
          },
          {
            title: "Build full stack applications",
            skills: ["Integration", "Deployment"],
            certifications: [],
            projects: ["Complete MERN application"],
            resources: ["Render", "Vercel", "GitHub"],
          },
        ],
      },
    ]);

    console.log("Inserting job roles...");

    await JobRole.insertMany([
      {
        title: "Frontend Developer",
        linkedCareerRoleId: frontendCareer._id,
        requiredSkills: [
          { name: "JavaScript", minLevel: "intermediate" },
          { name: "React", minLevel: "intermediate" },
          { name: "Next.js", minLevel: "beginner" },
          { name: "CSS", minLevel: "intermediate" },
        ],
        keywords: [
          "javascript",
          "react",
          "next.js",
          "responsive design",
          "ui",
        ],
      },
      {
        title: "Backend Developer",
        linkedCareerRoleId: backendCareer._id,
        requiredSkills: [
          { name: "Node.js", minLevel: "intermediate" },
          { name: "Express", minLevel: "intermediate" },
          { name: "MongoDB", minLevel: "beginner" },
          { name: "JWT", minLevel: "beginner" },
        ],
        keywords: ["node.js", "express", "mongodb", "api", "authentication"],
      },
      {
        title: "Full Stack Developer",
        linkedCareerRoleId: fullstackCareer._id,
        requiredSkills: [
          { name: "JavaScript", minLevel: "intermediate" },
          { name: "React", minLevel: "intermediate" },
          { name: "Node.js", minLevel: "intermediate" },
          { name: "MongoDB", minLevel: "beginner" },
        ],
        keywords: ["mern", "full stack", "react", "node.js", "mongodb"],
      },
    ]);

    console.log("Seed completed successfully");
    console.log("Templates inserted:", templates.length);
    console.log("Careers inserted:", careers.length);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();