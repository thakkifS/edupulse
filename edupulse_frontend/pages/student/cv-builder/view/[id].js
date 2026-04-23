import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../../../../context/AuthContext";
import axios from "axios";
import CVPreview from "../../../../components/CVPreview";

export default function CVView() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [cv, setCV] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { id } = router.query;

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    fetchCV();
  }, [user, id]);

  const fetchCV = async () => {
    if (!id) {
      console.error('CV ID is undefined');
      setError('CV ID is required');
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/cv/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setCV(response.data.data);
      }
    } catch (err) {
      setError("Failed to load CV");
      console.error("Error fetching CV:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCV = async () => {
    if (!id) {
      console.error('CV ID is undefined');
      alert('Cannot download CV: Missing ID');
      return;
    }
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/cv/${id}/download`, {
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
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `cv-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download CV");
      console.error("Error downloading CV:", err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to view this CV.</p>
          <button 
            onClick={() => router.push('/auth')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading CV...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
          <button 
            onClick={() => setError("")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">CV Not Found</h1>
          <p className="text-gray-600">The CV you're looking for doesn't exist.</p>
          <button 
            onClick={() => router.push('/student/cv-builder')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to CV Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/student/cv-builder')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to CV Builder
          </button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {cv.data?.personal?.fullName || 'Untitled CV'}
            </h1>
            <p className="text-gray-600">
              {cv.templateId?.name || 'Classic'} Template • {cv.status}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200 px-6 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
              {cv.templateId?.name || 'Classic'} Template
            </p>
          </div>

          <div className="p-8">
            <CVPreview 
              template={cv.templateId?.name || 'classic'} 
              data={cv.data} 
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={downloadCV}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
