import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../../context/AuthContext';
import { assignmentAPI, apiUtils } from '../../../services/api';
import HeaderDiffer from '../../../components/HeaderDiffer';

export default function StudentAssignments() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedModule, setSelectedModule] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    fetchAssignments();
  }, [user, selectedModule]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = selectedModule ? { moduleName: selectedModule } : {};
      const response = await assignmentAPI.listAssignments(params);
      setAssignments(response.data.assignments || []);
    } catch (err) {
      setError(apiUtils.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleViewAssignment = (assignment) => {
    router.push(`/student/assignments/${assignment._id}`);
  };

  const handleSubmitAssignment = (assignment) => {
    if (assignment.isClosed) {
      alert('This assignment is closed for submission.');
      return;
    }
    router.push(`/student/assignments/${assignment._id}/submit`);
  };

  const getSubmissionStatus = (assignment) => {
    if (!assignment.mySubmission) return { status: 'NOT_SUBMITTED', color: 'red', text: 'Not Submitted' };
    if (assignment.mySubmission.status === 'SUBMITTED') {
      const isLate = new Date(assignment.mySubmission.submittedAt) > new Date(assignment.deadline);
      return {
        status: isLate ? 'LATE' : 'SUBMITTED',
        color: isLate ? 'yellow' : 'green',
        text: isLate ? 'Submitted Late' : 'Submitted'
      };
    }
    return { status: 'NOT_SUBMITTED', color: 'red', text: 'Not Submitted' };
  };

  const getUniqueModules = () => {
    const modules = [...new Set(assignments.map(a => a.moduleName))];
    return modules.sort();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to access assignments.</p>
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

  return (
    <>
      <HeaderDiffer />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assignments</h1>
            <p className="text-gray-600">View and submit your course assignments</p>
          </div>

          {/* Module Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Module
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Modules</option>
              {getUniqueModules().map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H0z"></path>
                </svg>
                <span className="ml-2 text-gray-600">Loading assignments...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((assignment) => {
                const submissionStatus = getSubmissionStatus(assignment);
                return (
                  <div key={assignment._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                      <p className="text-sm text-gray-600 mb-1">Module: {assignment.moduleName}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{assignment.description}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Marks:</span>
                        <span className="font-medium">{assignment.totalMarks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Deadline:</span>
                        <span className={`font-medium ${assignment.isClosed ? 'text-red-600' : 'text-gray-900'}`}>
                          {new Date(assignment.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{assignment.submissionType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs rounded-full bg-${submissionStatus.color}-100 text-${submissionStatus.color}-800`}>
                          {submissionStatus.text}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewAssignment(assignment)}
                        className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        View Details
                      </button>
                      {!assignment.mySubmission && !assignment.isClosed && (
                        <button
                          onClick={() => handleSubmitAssignment(assignment)}
                          className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded text-sm hover:bg-green-200 transition-colors"
                        >
                          Submit
                        </button>
                      )}
                      {assignment.mySubmission && (
                        <button
                          onClick={() => router.push(`/student/assignments/${assignment._id}/submission`)}
                          className="flex-1 bg-purple-100 text-purple-700 py-2 px-3 rounded text-sm hover:bg-purple-200 transition-colors"
                        >
                          View Submission
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && assignments.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-600">There are no assignments available for the selected module.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
