import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../../../context/AuthContext';
import { assignmentAPI, apiUtils } from '../../../../services/api';
import HeaderDiffer from '../../../../components/HeaderDiffer';

export default function SubmitAssignment() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { id } = router.query;
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    if (id) {
      fetchAssignment();
    }
  }, [user, id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await assignmentAPI.getAssignment(id);
      setAssignment(response.data.assignment);
      
      // Check if assignment is closed
      if (response.data.assignment.isClosed) {
        setError('This assignment is closed for submission.');
      }
    } catch (err) {
      setError(apiUtils.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type based on assignment requirements
    const allowedTypes = {
      'PDF': ['application/pdf'],
      'DOCX': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'ZIP': ['application/zip', 'application/x-zip-compressed']
    };

    const fileType = file.type;
    const allowed = allowedTypes[assignment?.submissionType] || [];
    
    if (assignment?.submissionType !== 'TEXT' && !allowed.includes(fileType)) {
      setError(`Invalid file type. Please upload a ${assignment?.submissionType} file.`);
      return;
    }

    // Convert file to base64
    try {
      const base64 = await apiUtils.fileToBase64(file);
      setSelectedFile(file);
      setFilePreview(base64);
      setError('');
    } catch (err) {
      setError('Failed to process file. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!assignment) return;
    
    // Validate based on submission type
    if (assignment.submissionType === 'TEXT' && !submissionText.trim()) {
      setError('Please enter your submission text.');
      return;
    }
    
    if (assignment.submissionType !== 'TEXT' && !filePreview) {
      setError('Please select a file to upload.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const submissionData = {
        submissionText: assignment.submissionType === 'TEXT' ? submissionText.trim() : '',
        attachmentUrl: assignment.submissionType !== 'TEXT' ? filePreview : '',
        attachmentName: selectedFile ? selectedFile.name : ''
      };

      await assignmentAPI.submitAssignment(id, submissionData);
      setSuccess('Assignment submitted successfully!');
      
      // Redirect to assignment details after 2 seconds
      setTimeout(() => {
        router.push(`/student/assignments/${id}`);
      }, 2000);
      
    } catch (err) {
      setError(apiUtils.handleError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to submit assignments.</p>
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

  if (loading) {
    return (
      <>
        <HeaderDiffer />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H0z"></path>
            </svg>
            <span className="ml-2 text-gray-600">Loading assignment...</span>
          </div>
        </div>
      </>
    );
  }

  if (!assignment) {
    return (
      <>
        <HeaderDiffer />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Assignment Not Found</h1>
            <p className="text-gray-600 mb-4">The assignment you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/student/assignments')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Assignments
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderDiffer />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Assignment Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{assignment.title}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Module: <span className="font-medium">{assignment.moduleName}</span></p>
                <p className="text-sm text-gray-600">Total Marks: <span className="font-medium">{assignment.totalMarks}</span></p>
                <p className="text-sm text-gray-600">Submission Type: <span className="font-medium">{assignment.submissionType}</span></p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Deadline: <span className={`font-medium ${assignment.isClosed ? 'text-red-600' : 'text-gray-900'}`}>
                  {new Date(assignment.deadline).toLocaleDateString()}
                </span></p>
                <p className="text-sm text-gray-600">Status: <span className={`font-medium ${assignment.isClosed ? 'text-red-600' : 'text-green-600'}`}>
                  {assignment.isClosed ? 'Closed' : 'Open'}
                </span></p>
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">Instructions:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{assignment.instructions}</p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Submission Form */}
          {assignment.isClosed ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <svg className="h-16 w-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Assignment Closed</h3>
                <p className="text-gray-600">This assignment is no longer accepting submissions.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit Assignment</h2>

              {/* Text Submission */}
              {assignment.submissionType === 'TEXT' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer *
                  </label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your assignment response here..."
                    required
                  />
                </div>
              )}

              {/* File Submission */}
              {assignment.submissionType !== 'TEXT' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File ({assignment.submissionType}) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept={assignment.submissionType === 'PDF' ? '.pdf' : 
                             assignment.submissionType === 'DOCX' ? '.docx' : '.zip'}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : `Click to upload ${assignment.submissionType} file`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {assignment.submissionType === 'PDF' && 'PDF files only'}
                        {assignment.submissionType === 'DOCX' && 'DOCX files only'}
                        {assignment.submissionType === 'ZIP' && 'ZIP files only'}
                      </p>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push(`/student/assignments/${id}`)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
