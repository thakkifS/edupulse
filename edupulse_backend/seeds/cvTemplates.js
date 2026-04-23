const mongoose = require('mongoose');
const CvTemplate = require('../models/CvTemplate');

const cvTemplates = [
  {
    name: 'minimal',
    description: 'Clean and minimalist design perfect for tech professionals',
    previewImageUrl: '/templates/minimal-preview.jpg',
    htmlTemplate: `
      <div class="cv-minimal">
        <header class="cv-header">
          <h1>{{fullName}}</h1>
          <div class="contact-info">
            <p>{{email}} | {{phone}} | {{location}}</p>
            <p>{{linkedIn}} | {{github}}</p>
          </div>
        </header>
        <section class="summary">
          <h2>Professional Summary</h2>
          <p>{{summary}}</p>
        </section>
        <section class="experience">
          <h2>Experience</h2>
          {{#each experience}}
          <div class="experience-item">
            <h3>{{role}} at {{company}}</h3>
            <p>{{startDate}} - {{endDate}}</p>
            <p>{{description}}</p>
          </div>
          {{/each}}
        </section>
        <section class="education">
          <h2>Education</h2>
          {{#each education}}
          <div class="education-item">
            <h3>{{degree}} at {{school}}</h3>
            <p>{{startDate}} - {{endDate}}</p>
            {{#if gpa}}<p>GPA: {{gpa}}</p>{{/if}}
          </div>
          {{/each}}
        </section>
        <section class="skills">
          <h2>Skills</h2>
          <div class="skills-list">
            {{#each skills}}
            <span class="skill">{{this}}</span>
            {{/each}}
          </div>
        </section>
        <section class="projects">
          <h2>Projects</h2>
          {{#each projects}}
          <div class="project-item">
            <h3>{{name}}</h3>
            <p>{{technologies}}</p>
            <p>{{description}}</p>
            {{#if url}}<p><a href="{{url}}">View Project</a></p>{{/if}}
          </div>
          {{/each}}
        </section>
      </div>
    `,
    category: 'minimal',
    isActive: true
  },
  {
    name: 'professional',
    description: 'Traditional professional design for corporate roles',
    previewImageUrl: '/templates/professional-preview.jpg',
    htmlTemplate: `
      <div class="cv-professional">
        <header class="cv-header">
          <div class="header-content">
            <div class="name-section">
              <h1>{{fullName}}</h1>
              <div class="title">Professional Title</div>
            </div>
            <div class="contact-section">
              <p>{{email}}</p>
              <p>{{phone}}</p>
              <p>{{location}}</p>
              <p>{{linkedIn}}</p>
              <p>{{github}}</p>
            </div>
          </div>
        </header>
        <section class="summary">
          <h2>Professional Summary</h2>
          <p>{{summary}}</p>
        </section>
        <section class="experience">
          <h2>Professional Experience</h2>
          {{#each experience}}
          <div class="experience-item">
            <div class="experience-header">
              <h3>{{role}}</h3>
              <span class="company">{{company}}</span>
              <span class="duration">{{startDate}} - {{endDate}}</span>
            </div>
            <p>{{description}}</p>
          </div>
          {{/each}}
        </section>
        <section class="education">
          <h2>Education</h2>
          {{#each education}}
          <div class="education-item">
            <h3>{{degree}}</h3>
            <p>{{school}}</p>
            <p>{{startDate}} - {{endDate}}</p>
            {{#if gpa}}<p>GPA: {{gpa}}</p>{{/if}}
          </div>
          {{/each}}
        </section>
        <section class="skills">
          <h2>Technical Skills</h2>
          <div class="skills-grid">
            {{#each skills}}
            <div class="skill-item">{{this}}</div>
            {{/each}}
          </div>
        </section>
        <section class="projects">
          <h2>Projects</h2>
          {{#each projects}}
          <div class="project-item">
            <h3>{{name}}</h3>
            <p class="tech-stack">{{technologies}}</p>
            <p>{{description}}</p>
            {{#if url}}<p><a href="{{url}}">View Project</a></p>{{/if}}
          </div>
          {{/each}}
        </section>
      </div>
    `,
    category: 'professional',
    isActive: true
  },
  {
    name: 'modern',
    description: 'Contemporary design with creative elements',
    previewImageUrl: '/templates/modern-preview.jpg',
    htmlTemplate: `
      <div class="cv-modern">
        <aside class="sidebar">
          <div class="profile">
            <h1>{{fullName}}</h1>
            <div class="contact">
              <p>{{email}}</p>
              <p>{{phone}}</p>
              <p>{{location}}</p>
              <p>{{linkedIn}}</p>
              <p>{{github}}</p>
            </div>
          </div>
          <section class="skills">
            <h2>Skills</h2>
            <div class="skills-list">
              {{#each skills}}
              <div class="skill">{{this}}</div>
              {{/each}}
            </div>
          </section>
        </aside>
        <main class="main-content">
          <section class="summary">
            <h2>About Me</h2>
            <p>{{summary}}</p>
          </section>
          <section class="experience">
            <h2>Experience</h2>
            {{#each experience}}
            <div class="experience-item">
              <h3>{{role}}</h3>
              <h4>{{company}}</h4>
              <p class="date">{{startDate}} - {{endDate}}</p>
              <p>{{description}}</p>
            </div>
            {{/each}}
          </section>
          <section class="education">
            <h2>Education</h2>
            {{#each education}}
            <div class="education-item">
              <h3>{{degree}}</h3>
              <h4>{{school}}</h4>
              <p class="date">{{startDate}} - {{endDate}}</p>
              {{#if gpa}}<p>GPA: {{gpa}}</p>{{/if}}
            </div>
            {{/each}}
          </section>
          <section class="projects">
            <h2>Projects</h2>
            {{#each projects}}
            <div class="project-item">
              <h3>{{name}}</h3>
              <p class="tech">{{technologies}}</p>
              <p>{{description}}</p>
              {{#if url}}<p><a href="{{url}}">View Project</a></p>{{/if}}
            </div>
            {{/each}}
          </section>
        </main>
      </div>
    `,
    category: 'modern',
    isActive: true
  },
  {
    name: 'classic',
    description: 'Timeless traditional design for all industries',
    previewImageUrl: '/templates/classic-preview.jpg',
    htmlTemplate: `
      <div class="cv-classic">
        <header class="cv-header">
          <h1>{{fullName}}</h1>
          <div class="contact-info">
            <span>{{email}}</span> | 
            <span>{{phone}}</span> | 
            <span>{{location}}</span> | 
            <span>{{linkedIn}}</span> | 
            <span>{{github}}</span>
          </div>
        </header>
        
        <section class="summary">
          <h2>SUMMARY</h2>
          <p>{{summary}}</p>
        </section>
        
        <section class="experience">
          <h2>PROFESSIONAL EXPERIENCE</h2>
          {{#each experience}}
          <div class="experience-item">
            <div class="item-header">
              <h3>{{role}}</h3>
              <span class="company">{{company}}</span>
              <span class="duration">{{startDate}} - {{endDate}}</span>
            </div>
            <p>{{description}}</p>
          </div>
          {{/each}}
        </section>
        
        <section class="education">
          <h2>EDUCATION</h2>
          {{#each education}}
          <div class="education-item">
            <div class="item-header">
              <h3>{{degree}}</h3>
              <span class="school">{{school}}</span>
              <span class="duration">{{startDate}} - {{endDate}}</span>
            </div>
            {{#if gpa}}<p>GPA: {{gpa}}</p>{{/if}}
          </div>
          {{/each}}
        </section>
        
        <section class="skills">
          <h2>TECHNICAL SKILLS</h2>
          <div class="skills-container">
            {{#each skills}}
            <span class="skill-item">{{this}}</span>
            {{/each}}
          </div>
        </section>
        
        <section class="projects">
          <h2>PROJECTS</h2>
          {{#each projects}}
          <div class="project-item">
            <div class="item-header">
              <h3>{{name}}</h3>
              <span class="tech">{{technologies}}</span>
            </div>
            <p>{{description}}</p>
            {{#if url}}<p><a href="{{url}}">View Project</a></p>{{/if}}
          </div>
          {{/each}}
        </section>
      </div>
    `,
    category: 'professional',
    isActive: true
  }
];

async function seedTemplates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupulse');
    
    // Clear existing templates
    await CvTemplate.deleteMany({});
    
    // Insert new templates
    await CvTemplate.insertMany(cvTemplates);
    
    console.log('CV templates seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding templates:', error);
    process.exit(1);
  }
}

seedTemplates();
