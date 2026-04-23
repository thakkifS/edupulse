const jsPDF = require('jspdf');
const handlebars = require('handlebars');

const generateCvPdfBuffer = async (cv) => {
  try {
    // Create HTML content from template
    const template = cv.templateId?.htmlTemplate || getDefaultTemplate();
    const compiledTemplate = handlebars.compile(template);
    const htmlContent = compiledTemplate(cv.data);

    // Create PDF using jsPDF
    const doc = new jsPDF();
    
    // Add content to PDF
    doc.setFontSize(16);
    doc.text(cv.data.personal?.fullName || 'CV', 20, 20);
    
    doc.setFontSize(12);
    let yPosition = 30;
    
    // Contact info
    if (cv.data.personal?.email || cv.data.personal?.phone || cv.data.personal?.location) {
      const contactInfo = [];
      if (cv.data.personal?.email) contactInfo.push(cv.data.personal.email);
      if (cv.data.personal?.phone) contactInfo.push(cv.data.personal.phone);
      if (cv.data.personal?.location) contactInfo.push(cv.data.personal.location);
      
      doc.text(contactInfo.join(' | '), 20, yPosition);
      yPosition += 15;
    }
    
    // Summary
    if (cv.data.summary) {
      doc.setFontSize(14);
      doc.text('Summary', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(cv.data.summary, 170);
      doc.text(summaryLines, 20, yPosition);
      yPosition += summaryLines.length * 5 + 10;
    }
    
    // Experience
    if (cv.data.experience && cv.data.experience.length > 0) {
      doc.setFontSize(14);
      doc.text('Experience', 20, yPosition);
      yPosition += 10;
      
      cv.data.experience.forEach(exp => {
        doc.setFontSize(12);
        doc.text(`${exp.position} - ${exp.company}`, 20, yPosition);
        yPosition += 7;
        doc.setFontSize(10);
        doc.text(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, 20, yPosition);
        yPosition += 7;
        if (exp.description) {
          const descLines = doc.splitTextToSize(exp.description, 170);
          doc.text(descLines, 20, yPosition);
          yPosition += descLines.length * 5 + 5;
        }
        yPosition += 5;
      });
    }
    
    // Education
    if (cv.data.education && cv.data.education.length > 0) {
      doc.setFontSize(14);
      doc.text('Education', 20, yPosition);
      yPosition += 10;
      
      cv.data.education.forEach(edu => {
        doc.setFontSize(12);
        doc.text(`${edu.degree} - ${edu.institution}`, 20, yPosition);
        yPosition += 7;
        doc.setFontSize(10);
        doc.text(`${edu.startDate} - ${edu.endDate}`, 20, yPosition);
        yPosition += 7;
        if (edu.gpa) {
          doc.text(`GPA: ${edu.gpa}`, 20, yPosition);
          yPosition += 5;
        }
        yPosition += 5;
      });
    }
    
    // Skills
    if (cv.data.skills && cv.data.skills.length > 0) {
      doc.setFontSize(14);
      doc.text('Skills', 20, yPosition);
      yPosition += 10;
      
      const skillsText = cv.data.skills.map(skill => `${skill.name} (${skill.level})`).join(', ');
      const skillsLines = doc.splitTextToSize(skillsText, 170);
      doc.setFontSize(10);
      doc.text(skillsLines, 20, yPosition);
    }
    
    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

const getDefaultTemplate = () => {
  return `
    <div>
      <h2>{{data.personal.fullName}}</h2>
      <p>{{data.personal.email}} | {{data.personal.phone}} | {{data.personal.location}}</p>
      {{#if data.summary}}
      <h3>Summary</h3>
      <p>{{data.summary}}</p>
      {{/if}}
      {{#if data.experience}}
      <h3>Experience</h3>
      {{#each data.experience}}
      <p><strong>{{position}} - {{company}}</strong></p>
      <p>{{startDate}} - {{#if current}}Present{{else}}{{endDate}}{{/if}}</p>
      <p>{{description}}</p>
      {{/each}}
      {{/if}}
      {{#if data.education}}
      <h3>Education</h3>
      {{#each data.education}}
      <p><strong>{{degree}} - {{institution}}</strong></p>
      <p>{{startDate}} - {{endDate}}</p>
      {{/each}}
      {{/if}}
      {{#if data.skills}}
      <h3>Skills</h3>
      <p>{{#each data.skills}}{{name}} ({{level}}){{#unless @last}}, {{/unless}}{{/each}}</p>
      {{/if}}
    </div>
  `;
};

module.exports = { generateCvPdfBuffer };