import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../../../context/AuthContext";
import axios from "axios";
import CVForm from "../../../components/CVForm";
import CVPreview from "../../../components/CVPreview";
import CareerTabs from "../../../components/CareerTabs";
import RoadmapProgress from "../../../components/RoadmapProgress";
import RoadmapStepCard from "../../../components/RoadmapStepCard";
import { createRoadmapStep, RoadmapStepTypes } from "../../../types/roadmap";
import HeaderDiffer from "../../../components/HeaderDiffer";

export default function CVBuilder() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [currentCV, setCurrentCV] = useState(null);
  const [savedCVs, setSavedCVs] = useState([]);
  const [filteredCVs, setFilteredCVs] = useState([]);
  
  // Career Navigation State
  const [careerTabs, setCareerTabs] = useState(["Software Development", "Data Science", "Product Management", "Design"]);
  const [activeCareerTab, setActiveCareerTab] = useState("Software Development");
  const [roadmapSteps, setRoadmapSteps] = useState([
    createRoadmapStep("1", "Learn Programming Fundamentals", "Master core programming concepts and languages", RoadmapStepTypes.SKILL),
    createRoadmapStep("2", "Build Personal Projects", "Create a portfolio of real projects", RoadmapStepTypes.PROJECT),
    createRoadmapStep("3", "Get Internship Experience", "Gain professional experience", RoadmapStepTypes.INTERNSHIP),
    createRoadmapStep("4", "Obtain Certifications", "Earn industry-recognized certifications", RoadmapStepTypes.CERTIFICATION),
  ]);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterTemplate, setFilterTemplate] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [formData, setFormData] = useState({
    personal: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedIn: "",
      github: ""
    },
    summary: "",
    education: [],
    experience: [],
    skills: [],
    projects: []
  });

  
  useEffect(() => {
    let isMounted = true;
    
    if (user && isMounted) {
      fetchSavedCVs();
    }
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    let filtered = [...savedCVs];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(cv => 
        cv.data?.personal?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cv.templateId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by template type
    if (filterTemplate !== "all") {
      filtered = filtered.filter(cv => cv.templateId?.name === filterTemplate);
    }
    
    // Sort CVs
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
      case "name":
        filtered.sort((a, b) => (a.data?.personal?.fullName || "").localeCompare(b.data?.personal?.fullName || ""));
        break;
      case "template":
        filtered.sort((a, b) => (a.templateId?.name || "").localeCompare(b.templateId?.name || ""));
        break;
      default:
        break;
    }
    
    setFilteredCVs(filtered);
  }, [savedCVs, searchTerm, filterTemplate, sortBy]);

  const fetchSavedCVs = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/cv`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSavedCVs(response.data.data);
    } catch (err) {
      console.error('Error fetching CVs:', err);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.personal.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (!formData.personal.fullName || !/^[a-zA-Z\s]+$/.test(formData.personal.fullName)) {
      errors.fullName = "Name should contain only letters and spaces";
    }
    
    if (!formData.personal.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.personal.email)) {
      errors.email = "Invalid email format";
    }
    
    if (!formData.personal.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.personal.phone)) {
      errors.phone = "Invalid phone number format";
    }
    
    if (!formData.summary.trim()) {
      errors.summary = "Professional summary is required";
    } else if (formData.summary.length < 50) {
      errors.summary = "Summary should be at least 50 characters";
    }
    
    if (formData.skills.length === 0) {
      errors.skills = "At least one skill is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setCurrentView("templates");
  };

  const selectTemplate = (template) => {
    if (!template || typeof template !== 'string') {
      console.error('Template is undefined or invalid');
      return;
    }
    // Store form data in localStorage to pass to create page
    localStorage.setItem('cvFormData', JSON.stringify(formData));
    router.push(`/student/cv-builder/create/${template}`);
  };

  const downloadCV = async (cvId) => {
    if (!cvId) {
      console.error('CV ID is required for download');
      alert('Cannot download CV: Missing ID');
      return;
    }
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/cv/${cvId}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      
      if (!response.data) {
        console.error('Response data is undefined');
        alert('Failed to download CV: No data received');
        return;
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cv_${cvId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading CV:', err);
    }
  };

  const deleteCV = async (cvId) => {
    if (!cvId) {
      console.error('CV ID is required for deletion');
      alert('Cannot delete CV: Missing ID');
      return;
    }
    if (!confirm('Are you sure you want to delete this CV?')) {
      return;
    }
    
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/cv/${cvId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setSavedCVs(prev => prev.filter(cv => cv._id !== cvId));
    } catch (err) {
      console.error('Error deleting CV:', err);
    }
  };

  // Career Navigation Functions
  const handleCareerTabChange = (tab) => {
    setActiveCareerTab(tab);
    // Load career-specific roadmap based on selected career
    loadCareerRoadmap(tab);
  };

  const loadCareerRoadmap = async (career) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/career/roadmap/${career}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setRoadmapSteps(response.data.data.steps);
        setCompletedSteps(response.data.data.completedSteps);
      }
    } catch (err) {
      setError("Failed to load career roadmap");
      console.error(err);
    }
  };

  const toggleRoadmapStep = async (stepId) => {
    try {
      const updatedSteps = roadmapSteps.map(step => 
        step.id === stepId ? { ...step, completed: !step.completed } : step
      );
      setRoadmapSteps(updatedSteps);

      const newCompletedCount = updatedSteps.filter(step => step.completed).length;
      setCompletedSteps(newCompletedCount);

      // Save progress to backend
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/career/progress`,
        {
          career: activeCareerTab,
          stepId,
          completed: !updatedSteps.find(step => step.id === stepId)?.completed
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
    } catch (err) {
      setError("Failed to update progress");
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      personal: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
        linkedIn: "",
        github: ""
      },
      summary: "",
      education: [],
      experience: [],
      skills: [],
      projects: []
    });
    setFormErrors({});
    setCurrentView("dashboard");
    setSelectedTemplate("");
  };

  if (!user) {
    return (
      <>
        <HeaderDiffer />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to CV Builder</h2>
                <p className="text-gray-600 mb-8">Please sign in to access your professional CV creation tools</p>
                <button 
                  onClick={() => router.push('/auth')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Sign In to Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderDiffer />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Professional CV Builder
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create stunning, professional CVs that stand out. Choose from our premium templates and build your perfect resume in minutes.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full shadow-lg p-1 flex space-x-1">
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  currentView === "dashboard"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView("templates")}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  currentView === "templates"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setCurrentView("saved")}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  currentView === "saved"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                My CVs ({savedCVs.length})
              </button>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  showAnalytics
                    ? "bg-gradient-to-r from-green-600 to-teal-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setCurrentView("career")}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  currentView === "career"
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Career Path
              </button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          {currentView === "saved" && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search CVs</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name or template..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Template</label>
                  <select
                    value={filterTemplate}
                    onChange={(e) => setFilterTemplate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Templates</option>
                    <option value="minimal">Minimal</option>
                    <option value="professional">Professional</option>
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="template">Template Type</option>
                  </select>
                </div>
              </div>
              
              {(searchTerm || filterTemplate !== "all") && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredCVs.length} of {savedCVs.length} CVs
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterTemplate("all");
                      setSortBy("recent");
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Dashboard View */}
          {currentView === "dashboard" && (
            <div className="space-y-8">
              {/* Create New CV Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New CV</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.personal.fullName}
                        onChange={(e) => setFormData({...formData, personal: {...formData.personal, fullName: e.target.value}})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="John Doe"
                      />
                      {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.personal.email}
                        onChange={(e) => setFormData({...formData, personal: {...formData.personal, email: e.target.value}})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="john@example.com"
                      />
                      {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.personal.phone}
                        onChange={(e) => setFormData({...formData, personal: {...formData.personal, phone: e.target.value}})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="+1 234 567 8900"
                      />
                      {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.personal.location}
                        onChange={(e) => setFormData({...formData, personal: {...formData.personal, location: e.target.value}})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="New York, NY"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary *</label>
                    <textarea
                      name="summary"
                      value={formData.summary}
                      onChange={(e) => setFormData({...formData, summary: e.target.value})}
                      rows={4}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.summary ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Write a compelling summary about your professional background and expertise..."
                    />
                    {formErrors.summary && <p className="text-red-500 text-sm mt-1">{formErrors.summary}</p>}
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          personal: { fullName: "", email: "", phone: "", location: "", linkedIn: "", github: "" },
                          summary: "",
                          education: [],
                          experience: [],
                          skills: [],
                          projects: []
                        });
                        setFormErrors({});
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear Form
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      Choose Template
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing CVs Section */}
              {savedCVs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Existing CVs</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedCVs.map((cv) => (
                      <div key={cv._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <div className={`h-20 bg-gradient-to-br mb-4 rounded-lg flex items-center justify-center ${
                          cv.templateId?.name === 'minimal' ? 'from-gray-400 to-gray-600' :
                          cv.templateId?.name === 'professional' ? 'from-blue-400 to-blue-600' :
                          cv.templateId?.name === 'modern' ? 'from-purple-400 to-purple-600' :
                          'from-green-400 to-green-600'
                        }`}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">
                          {cv.data?.personal?.fullName || 'Untitled CV'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {cv.templateId?.name || 'Classic'} Template
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                          Updated {cv.updatedAt && !isNaN(new Date(cv.updatedAt).getTime()) ? new Date(cv.updatedAt).toLocaleDateString() : 'Invalid Date'}
                        </p>
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => {
                              if (!cv._id) {
                                console.error('CV ID is undefined');
                                alert('Cannot edit CV: Missing ID');
                                return;
                              }
                              const templateName = cv.templateId?.name || 'classic';
                              router.push(`/student/cv-builder/create/${templateName}?id=${cv._id}`);
                            }}
                            className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                          >
                            Edit CV
                          </button>
                          <button
                            onClick={() => {
                              if (!cv._id) {
                                console.error('CV ID is undefined');
                                alert('Cannot download CV: Missing ID');
                                return;
                              }
                              downloadCV(cv._id);
                            }}
                            className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors font-medium"
                          >
                            Download PDF
                          </button>
                          <button
                            onClick={() => {
                              if (!cv._id) {
                                console.error('CV ID is undefined');
                                alert('Cannot delete CV: Missing ID');
                                return;
                              }
                              deleteCV(cv._id);
                            }}
                            className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors font-medium"
                          >
                            Delete CV
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Templates View */}
          {currentView === "templates" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Template</h2>
                <p className="text-lg text-gray-600">Select from our professionally designed templates</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Simple Template */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105">
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 p-6">
                    <div className="bg-white rounded-lg p-4 h-full shadow-sm">
                      <div className="text-center mb-3">
                        <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2"></div>
                        <h4 className="font-bold text-gray-800">John Doe</h4>
                        <p className="text-sm text-gray-600">Software Engineer</p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-300 rounded w-full"></div>
                        <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Simple</h3>
                    <p className="text-gray-600 mb-4">Clean and minimalist design perfect for any industry</p>
                    <button
                      onClick={() => selectTemplate('simple')}
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all font-medium"
                    >
                      Use Simple Template
                    </button>
                  </div>
                </div>

                {/* Modern Template */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105">
                  <div className="h-64 bg-gradient-to-br from-purple-500 to-pink-500 p-6">
                    <div className="bg-white bg-opacity-90 rounded-lg p-4 h-full shadow-lg">
                      <div className="text-center mb-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto mb-2"></div>
                        <h4 className="font-bold text-gray-800">John Doe</h4>
                        <p className="text-sm text-purple-600 font-medium">Software Engineer</p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-purple-300 rounded w-full"></div>
                        <div className="h-2 bg-purple-300 rounded w-3/4"></div>
                        <div className="h-2 bg-purple-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Modern</h3>
                    <p className="text-gray-600 mb-4">Contemporary design with vibrant colors and bold layout</p>
                    <button
                      onClick={() => selectTemplate('modern')}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                    >
                      Use Modern Template
                    </button>
                  </div>
                </div>

                {/* Professional Template */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105">
                  <div className="h-64 bg-gradient-to-br from-blue-600 to-blue-800 p-6">
                    <div className="bg-white rounded-lg p-4 h-full shadow-lg">
                      <div className="border-b-2 border-blue-600 pb-3 mb-3">
                        <h4 className="font-bold text-gray-800 text-lg">John Doe</h4>
                        <p className="text-sm text-blue-600 font-medium">Software Engineer</p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-blue-200 rounded w-full"></div>
                        <div className="h-2 bg-blue-200 rounded w-3/4"></div>
                        <div className="h-2 bg-blue-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Professional</h3>
                    <p className="text-gray-600 mb-4">Traditional corporate style perfect for business roles</p>
                    <button
                      onClick={() => selectTemplate('professional')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
                    >
                      Use Professional Template
                    </button>
                  </div>
                </div>

                {/* Classic Template */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105">
                  <div className="h-64 bg-gradient-to-br from-green-600 to-teal-600 p-6">
                    <div className="bg-white bg-opacity-95 rounded-lg p-4 h-full shadow-lg">
                      <div className="text-center mb-3">
                        <div className="w-12 h-12 bg-green-600 rounded-full mx-auto mb-2 border-2 border-white"></div>
                        <h4 className="font-bold text-gray-800 text-lg">John Doe</h4>
                        <p className="text-sm text-green-700 font-medium">Software Engineer</p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-green-200 rounded w-full"></div>
                        <div className="h-2 bg-green-200 rounded w-3/4"></div>
                        <div className="h-2 bg-green-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Classic</h3>
                    <p className="text-gray-600 mb-4">Timeless and elegant design for a sophisticated look</p>
                    <button
                      onClick={() => selectTemplate('classic')}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all font-medium"
                    >
                      Use Classic Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Career Path View */}
          {currentView === "career" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Career Development Path</h2>
                <p className="text-lg text-gray-600">Choose your career path and track your progress</p>
              </div>

              {/* Career Tabs */}
              <CareerTabs 
                items={careerTabs}
                activeItem={activeCareerTab}
                onChange={handleCareerTabChange}
              />

              {/* Roadmap Progress */}
              <RoadmapProgress 
                title={activeCareerTab}
                progress={Math.round((completedSteps / roadmapSteps.length) * 100)}
                totalSteps={roadmapSteps.length}
                completedSteps={completedSteps}
              />

              {/* Roadmap Steps */}
              <div className="space-y-4">
                {roadmapSteps.map((step) => (
                  <RoadmapStepCard
                    key={step.id}
                    step={step}
                    completed={step.completed}
                    onToggle={toggleRoadmapStep}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Analytics View */}
          {currentView === "analytics" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">CV Analytics</h2>
                <p className="text-lg text-gray-600">Track your CV creation and performance metrics</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{savedCVs.length}</h3>
                  <p className="text-gray-600">Total CVs Created</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-4.5 4.5L4 15l3-3" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {savedCVs.filter(cv => cv.status === 'completed').length}
                  </h3>
                  <p className="text-gray-600">Completed CVs</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {savedCVs.filter(cv => cv.status === 'draft').length}
                  </h3>
                  <p className="text-gray-600">Draft CVs</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {Object.keys(savedCVs.reduce((acc, cv) => {
                      acc[cv.templateId?.name || 'classic'] = (acc[cv.templateId?.name || 'classic'] || 0) + 1;
                      return acc;
                    }, {})).length || 1}
                  </h3>
                  <p className="text-gray-600">Template Types Used</p>
                </div>
              </div>

              {/* Template Usage Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Template Usage</h3>
                <div className="space-y-3">
                  {["minimal", "professional", "modern", "classic"].map(template => {
                    const count = savedCVs.filter(cv => cv.templateId?.name === template).length;
                    const percentage = savedCVs.length > 0 ? (count / savedCVs.length * 100).toFixed(1) : 0;
                    return (
                      <div key={template} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">{template}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Saved CVs View */}
          {currentView === "saved" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">My Saved CVs</h2>
                <p className="text-lg text-gray-600">Manage and download your created CVs</p>
              </div>

              {savedCVs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No CVs Yet</h3>
                  <p className="text-gray-600 mb-6">Create your first professional CV to get started</p>
                  <button
                    onClick={() => setCurrentView("templates")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Create Your First CV
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCVs.map((cv) => (
                    <div key={cv._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <div className={`h-32 bg-gradient-to-br flex items-center justify-center ${
                        cv.templateId?.name === 'minimal' ? 'from-gray-400 to-gray-600' :
                        cv.templateId?.name === 'professional' ? 'from-blue-400 to-blue-600' :
                        cv.templateId?.name === 'modern' ? 'from-purple-400 to-purple-600' :
                        'from-green-400 to-green-600'
                      }`}>
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {cv.data?.personal?.fullName || 'Untitled CV'}
                        </h3>
                        <p className="text-gray-600 mb-1">
                          {cv.templateId?.name || 'Classic'} Template
                        </p>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-500">
                            Updated {cv.updatedAt && !isNaN(new Date(cv.updatedAt).getTime()) ? new Date(cv.updatedAt).toLocaleDateString() : 'Invalid Date'}
                          </p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            cv.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {cv.status === 'completed' ? 'Completed' : 'Draft'}
                          </span>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => {
                              if (!cv._id) {
                                console.error('CV ID is undefined');
                                alert('Cannot edit CV: Missing ID');
                                return;
                              }
                              const templateName = cv.templateId?.name || 'classic';
                              router.push(`/student/cv-builder/create/${templateName}?id=${cv._id}`);
                            }}
                            className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                          >
                            Edit CV
                          </button>
                          <button
                            onClick={() => {
                              if (!cv._id) {
                                console.error('CV ID is undefined');
                                alert('Cannot download CV: Missing ID');
                                return;
                              }
                              downloadCV(cv._id);
                            }}
                            className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors font-medium"
                          >
                            Download PDF
                          </button>
                          <button
                            onClick={() => {
                              if (!cv._id) {
                                console.error('CV ID is undefined');
                                alert('Cannot delete CV: Missing ID');
                                return;
                              }
                              deleteCV(cv._id);
                            }}
                            className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors font-medium"
                          >
                            Delete CV
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
