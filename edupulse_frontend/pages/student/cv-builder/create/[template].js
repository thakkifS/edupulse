import { useState, useEffect, useContext } from "react"; // ✅ FIXED
import { useRouter } from "next/router";
import { AuthContext } from "../../../../context/AuthContext";
import axios from "axios";
import CVForm from "../../../../components/CVForm";
import CVPreview from "../../../../components/CVPreview";
import PDFPreview from "../../../../components/PDFPreview";

export default function CVBuilderTemplate() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [cvData, setCvData] = useState({
    personal: {},
    summary: "",
    education: [],
    experience: [],
    skills: [],
    projects: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState([]);

  const { template } = router.query;

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    // Load form data from localStorage if available
    const savedFormData = localStorage.getItem('cvFormData');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setCvData(parsedData);
        localStorage.removeItem('cvFormData'); // Clear after loading
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    }
    
    // Check if editing existing CV
    const cvId = router.query.id;
    if (cvId) {
      loadExistingCV(cvId);
    }
    
    fetchTemplates();
  }, [user, template]);

  const loadExistingCV = async (cvId) => {
    if (!cvId) {
      console.error('CV ID is undefined');
      setError('CV ID is required');
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cv/${cvId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setCvData(response.data.data.data);
      }
    } catch (err) {
      setError("Failed to load existing CV");
      console.error(err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cv/templates`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setTemplates(response.data.data);
      }
    } catch (err) {
      setError("Failed to load templates");
      console.error(err);
    }
  };

  const saveCV = async (status = "draft") => {
    try {
      setIsLoading(true);
      setError("");

      const selectedTemplate = templates.find(
        (t) => t.name.toLowerCase() === (template || '')
      );

      const cvId = router.query.id;
      const url = cvId ? `${process.env.NEXT_PUBLIC_API_URL}/api/cv/${cvId}` : `${process.env.NEXT_PUBLIC_API_URL}/api/cv`;
      const method = cvId ? 'put' : 'post';

      const response = await axios[method](
        url,
        {
          templateId: selectedTemplate?._id,
          data: cvData,
          status: status
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        if (status === "completed") {
          alert("CV created successfully!");
          router.push("/student/cv-builder");
        } else {
          alert("CV saved as draft!");
        }
      }
    } catch (err) {
      setError("Failed to save CV");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCV = async () => {
    try {
      setIsLoading(true);
      setError("");

      const cvId = router.query.id;
      if (!cvId) {
        // Save CV first if it doesn't exist
        await saveCV("completed");
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cv/${cvId}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob'
        }
      );

      if (!response.data) {
        console.error('Response data is undefined');
        alert('Failed to download CV: No data received');
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cv_${cvData.personal.fullName || 'resume'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      setError("Failed to download CV");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please Sign In
          </h1>
          <p className="text-gray-600">
            You need to be signed in to access the CV Builder.
          </p>
          <button
            onClick={() => router.push("/auth")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  const templateVariants = {
    classic: {
      preview: "Classic Professional - Clean and traditional layout"
    },
    modern: {
      preview: "Modern Creative - Contemporary design"
    },
    minimal: {
      preview: "Minimal Clean - Simple and clean layout"
    }
  };

  const currentVariant =
    templateVariants[template] || templateVariants.classic;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <span className="text-sm font-medium text-gray-900">Information</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <span className="text-sm text-gray-500">Preview</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <span className="text-sm text-gray-500">Download</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Step 1 of 3
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '33%' }}></div>
          </div>
        </div>

        {/* Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* LEFT SIDE - FORM */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">Your Information</h2>
                <p className="text-indigo-100 text-sm">Fill in your professional details</p>
              </div>
              
              {/* Form Content */}
              <div className="p-6">
                <CVForm data={cvData} setData={setCvData} />
              </div>
              
              {/* Form Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    All fields marked with * are required
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Auto-saving</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - PREVIEW */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-[800px]">
              {/* Preview Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
                    <p className="text-gray-600 text-sm">See your CV in real-time</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3"/>
                      </svg>
                      Live
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-hidden bg-gray-50">
                <PDFPreview 
                  template={template} 
                  data={cvData} 
                  onDownload={saveCV}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => saveCV("draft")}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                    </svg>
                    Save as Draft
                  </>
                )}
              </button>
              <button
                onClick={downloadCV}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
              <button
                onClick={() => saveCV("completed")}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Create CV
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Tips</h3>
            <p className="text-gray-600">Make your CV stand out with these expert recommendations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Keep it Concise</h4>
              <p className="text-sm text-gray-600">Aim for 1-2 pages maximum. Focus on relevant experience and achievements.</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Quantify Achievements</h4>
              <p className="text-sm text-gray-600">Use numbers and metrics to show the impact of your work.</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Tailor to Role</h4>
              <p className="text-sm text-gray-600">Customize your CV for each job application to highlight relevant skills.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}