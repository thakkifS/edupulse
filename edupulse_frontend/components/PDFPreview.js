import { useState } from 'react';

export default function PDFPreview({ template, data, onDownload, isLoading }) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTab, setActiveTab] = useState('preview');

  const getTemplateStyles = () => {
    const styles = {
      minimal: {
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        headerBg: '#ffffff',
        textColor: '#2c3e50',
        accentColor: '#3498db',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      professional: {
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        headerBg: '#ffffff',
        textColor: '#2c3e50',
        accentColor: '#3498db',
        fontFamily: 'Georgia, serif'
      },
      modern: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        headerBg: '#ffffff',
        textColor: '#2c3e50',
        accentColor: '#667eea',
        fontFamily: 'Poppins, sans-serif'
      },
      classic: {
        background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
        headerBg: '#ffffff',
        textColor: '#2c3e50',
        accentColor: '#7f8c8d',
        fontFamily: 'Times New Roman, serif'
      }
    };
    return styles[template] || styles.minimal;
  };

  const styles = getTemplateStyles();

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
  };

  return (
    <div className="pdf-preview-container">
      {/* Preview Controls */}
      <div className="preview-controls">
        <div className="controls-left">
          <div className="tab-navigation">
            <button
              className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
            <button
              className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Template Info
            </button>
          </div>
        </div>
        
        <div className="controls-center">
          <div className="zoom-controls">
            <button
              className="zoom-btn"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <span className="zoom-level">{zoomLevel}%</span>
            <button
              className="zoom-btn"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 150}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="controls-right">
          <button
            className="download-btn"
            onClick={handleDownload}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="preview-content">
        {activeTab === 'preview' ? (
          <div className="preview-viewport">
            <div 
              className="preview-canvas"
              style={{ 
                transform: `scale(${zoomLevel / 100})`,
                fontFamily: styles.fontFamily
              }}
            >
              {/* PDF Document Preview */}
              <div className="pdf-document" style={{ background: styles.background }}>
                {/* Document Header */}
                <div 
                  className="document-header"
                  style={{ 
                    background: styles.headerBg,
                    color: styles.textColor,
                    borderBottom: `2px solid ${styles.accentColor}`
                  }}
                >
                  <div className="header-content">
                    <h1 className="document-title">
                      {data.personal?.fullName || "Your Name"}
                    </h1>
                    <div className="contact-info">
                      <div className="contact-row">
                        <span> {data.personal?.email || "email@example.com"} </span>
                        <span> {data.personal?.phone || "Phone Number"} </span>
                        <span> {data.personal?.location || "Location"} </span>
                      </div>
                      <div className="contact-row">
                        <span> {data.personal?.linkedIn || "LinkedIn"} </span>
                        <span> {data.personal?.github || "GitHub"} </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Body */}
                <div className="document-body" style={{ color: styles.textColor }}>
                  {/* Summary Section */}
                  {data.summary && (
                    <section className="document-section">
                      <h2 style={{ color: styles.accentColor }}>Professional Summary</h2>
                      <p>{data.summary}</p>
                    </section>
                  )}

                  {/* Experience Section */}
                  {data.experience && data.experience.length > 0 && (
                    <section className="document-section">
                      <h2 style={{ color: styles.accentColor }}>Professional Experience</h2>
                      {data.experience.map((exp, index) => (
                        <div key={exp.id || index} className="experience-item">
                          <div className="item-header">
                            <h3>{exp.role} at {exp.company}</h3>
                            <span className="date-range">{exp.startDate} - {exp.endDate}</span>
                          </div>
                          <p>{exp.description}</p>
                        </div>
                      ))}
                    </section>
                  )}

                  {/* Education Section */}
                  {data.education && data.education.length > 0 && (
                    <section className="document-section">
                      <h2 style={{ color: styles.accentColor }}>Education</h2>
                      {data.education.map((edu, index) => (
                        <div key={edu.id || index} className="education-item">
                          <div className="item-header">
                            <h3>{edu.degree} at {edu.school}</h3>
                            <span className="date-range">{edu.startDate} - {edu.endDate}</span>
                            {edu.gpa && <span className="gpa">GPA: {edu.gpa}</span>}
                          </div>
                        </div>
                      ))}
                    </section>
                  )}

                  {/* Skills Section */}
                  {data.skills && data.skills.length > 0 && (
                    <section className="document-section">
                      <h2 style={{ color: styles.accentColor }}>Skills</h2>
                      <div className="skills-grid">
                        {data.skills.map((skill, index) => (
                          <span 
                            key={index} 
                            className="skill-tag"
                            style={{ 
                              background: `${styles.accentColor}15`,
                              color: styles.accentColor,
                              border: `1px solid ${styles.accentColor}30`
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Projects Section */}
                  {data.projects && data.projects.length > 0 && (
                    <section className="document-section">
                      <h2 style={{ color: styles.accentColor }}>Projects</h2>
                      {data.projects.map((project, index) => (
                        <div key={project.id || index} className="project-item">
                          <div className="item-header">
                            <h3>{project.name}</h3>
                            <span className="tech-stack">{project.technologies}</span>
                          </div>
                          <p>{project.description}</p>
                          {project.url && (
                            <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ color: styles.accentColor }}>
                              View Project
                            </a>
                          )}
                        </div>
                      ))}
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="template-info">
            <div className="info-card">
              <h3>Template Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Template Name:</label>
                  <span className="template-name capitalize">{template}</span>
                </div>
                <div className="info-item">
                  <label>Style:</label>
                  <span className="template-style capitalize">{template} Design</span>
                </div>
                <div className="info-item">
                  <label>Sections:</label>
                  <div className="sections-list">
                    <span>Header</span>
                    <span>Summary</span>
                    <span>Experience</span>
                    <span>Education</span>
                    <span>Skills</span>
                    <span>Projects</span>
                  </div>
                </div>
                <div className="info-item">
                  <label>Format:</label>
                  <span>A4 (210 × 297 mm)</span>
                </div>
              </div>
              <div className="template-description">
                <h4>Description</h4>
                <p>
                  {template === 'minimal' && 'Clean and minimalist design perfect for tech professionals and modern roles.'}
                  {template === 'professional' && 'Traditional professional design ideal for corporate and formal positions.'}
                  {template === 'modern' && 'Contemporary design with creative elements for innovative industries.'}
                  {template === 'classic' && 'Timeless traditional design suitable for all industries and experience levels.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .pdf-preview-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #f8f9fa;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
        }

        .preview-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .controls-left {
          display: flex;
          align-items: center;
        }

        .tab-navigation {
          display: flex;
          gap: 4px;
        }

        .tab-btn {
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .tab-btn.active {
          background: #3b82f6;
          color: white;
        }

        .controls-center {
          display: flex;
          align-items: center;
        }

        .zoom-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #f3f4f6;
          border-radius: 8px;
        }

        .zoom-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .zoom-btn:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .zoom-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .zoom-level {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          min-width: 40px;
          text-align: center;
        }

        .controls-right {
          display: flex;
          align-items: center;
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .download-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-1px);
        }

        .download-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .preview-content {
          flex: 1;
          overflow: hidden;
        }

        .preview-viewport {
          height: 100%;
          overflow: auto;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 40px 20px;
        }

        .preview-canvas {
          transition: transform 0.2s ease;
          transform-origin: top center;
        }

        .pdf-document {
          width: 210mm;
          min-height: 297mm;
          background: white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        .document-header {
          padding: 40px;
          text-align: center;
        }

        .document-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 20px 0;
          letter-spacing: -0.5px;
        }

        .contact-info {
          font-size: 12px;
          line-height: 1.6;
        }

        .contact-row {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 8px;
        }

        .document-body {
          padding: 0 40px 40px;
        }

        .document-section {
          margin-bottom: 32px;
        }

        .document-section h2 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 16px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 2px solid;
          padding-bottom: 8px;
        }

        .document-section p {
          font-size: 12px;
          line-height: 1.6;
          margin: 0 0 12px 0;
        }

        .experience-item, .education-item, .project-item {
          margin-bottom: 20px;
          padding-left: 16px;
          border-left: 3px solid;
        }

        .item-header {
          display: flex;
          flex-direction: column;
          margin-bottom: 8px;
        }

        .item-header h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .date-range, .gpa, .tech-stack {
          font-size: 11px;
          opacity: 0.8;
          margin-bottom: 4px;
        }

        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skill-tag {
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 500;
        }

        .template-info {
          height: 100%;
          overflow: auto;
          padding: 40px 20px;
          display: flex;
          justify-content: center;
        }

        .info-card {
          background: white;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          width: 100%;
        }

        .info-card h3 {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 24px 0;
          color: #1f2937;
        }

        .info-grid {
          display: grid;
          gap: 20px;
          margin-bottom: 32px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-item label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .template-name, .template-style {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
        }

        .sections-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .sections-list span {
          padding: 4px 8px;
          background: #f3f4f6;
          border-radius: 4px;
          font-size: 12px;
          color: #4b5563;
        }

        .template-description h4 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #1f2937;
        }

        .template-description p {
          font-size: 14px;
          line-height: 1.6;
          color: #4b5563;
          margin: 0;
        }

        .capitalize {
          text-transform: capitalize;
        }

        @media (max-width: 768px) {
          .preview-controls {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .controls-left, .controls-center, .controls-right {
            justify-content: center;
          }

          .pdf-document {
            width: 100%;
            max-width: 210mm;
          }

          .document-header, .document-body {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}
