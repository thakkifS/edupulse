import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../../context/AuthContext';
import { assignmentAPI, moduleAPI, apiUtils } from '../../../services/api';
import HeaderDiffer from '../../../components/HeaderDiffer';

export default function TutorAssignments() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  
  const [assignments, setAssignments] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    fetchData();
  }, [user, selectedModule]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, modulesRes] = await Promise.all([
        assignmentAPI.listAssignments(selectedModule),
        moduleAPI.listModules()
      ]);
      setAssignments(assignmentsRes.data.assignments || []);
      setModules(modulesRes.data.modules || []);
    } catch (err) {
      setError(apiUtils.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = () => {
    setShowCreateModal(true);
  };

  const handleEditAssignment = (assignment) => {
    router.push(`/tutor/assignments/${assignment._id}/edit`);
  };

  const handleViewSubmissions = (assignment) => {
    router.push(`/tutor/assignments/${assignment._id}/submissions`);
  };

  const handlePublishAssignment = async (assignmentId) => {
    try {
      await assignmentAPI.publishAssignment(assignmentId);
      fetchData();
    } catch (err) {
      setError(apiUtils.handleError(err));
    }
  };

  const handleCloseAssignment = async (assignmentId) => {
    try {
      await assignmentAPI.closeAssignment(assignmentId);
      fetchData();
    } catch (err) {
      setError(apiUtils.handleError(err));
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      await assignmentAPI.deleteAssignment(assignmentId);
      fetchData();
    } catch (err) {
      setError(apiUtils.handleError(err));
    }
  };

  const getUniqueModules = () => {
    const moduleNames = [...new Set(assignments.map(a => a.moduleName))];
    return moduleNames.sort();
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
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assignments</h1>
              <p className="text-gray-600">Create and manage course assignments</p>
            </div>
            <button
              onClick={handleCreateAssignment}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Assignment
            </button>
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
              {assignments.map((assignment) => (
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
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        assignment.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAssignment(assignment)}
                        className="flex-1 bg-blue-100 text-blue-700 py-1 px-2 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewSubmissions(assignment)}
                        className="flex-1 bg-purple-100 text-purple-700 py-1 px-2 rounded text-sm hover:bg-purple-200 transition-colors"
                      >
                        Submissions
                      </button>
                    </div>
                    
                    <div className="flex space-x-2">
                      {assignment.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublishAssignment(assignment._id)}
                          className="flex-1 bg-green-100 text-green-700 py-1 px-2 rounded text-sm hover:bg-green-200 transition-colors"
                        >
                          Publish
                        </button>
                      )}
                      
                      {assignment.status === 'PUBLISHED' && !assignment.isClosed && (
                        <button
                          onClick={() => handleCloseAssignment(assignment._id)}
                          className="flex-1 bg-orange-100 text-orange-700 py-1 px-2 rounded text-sm hover:bg-orange-200 transition-colors"
                        >
                          Close
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteAssignment(assignment._id)}
                        className="flex-1 bg-red-100 text-red-700 py-1 px-2 rounded text-sm hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
              <p className="text-gray-600 mb-4">Get started by creating your first assignment.</p>
              <button
                onClick={handleCreateAssignment}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Assignment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <CreateAssignmentModal
          modules={modules}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}
    </>
  );
}

// Create Assignment Modal Component
function CreateAssignmentModal({ modules, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moduleName: '',
    totalMarks: 100,
    deadline: '',
    submissionType: 'TEXT',
    instructions: '',
    status: 'DRAFT'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      await assignmentAPI.createAssignment({
        ...formData,
        deadline: new Date(formData.deadline).toISOString()
      });
      
      onSuccess();
    } catch (err) {
      setError(apiUtils.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Assignment</h2>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module *
                </label>
                <select
                  name="moduleName"
                  value={formData.moduleName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Module</option>
                  {modules.map(module => (
                    <option key={module._id} value={module.name}>
                      {module.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Marks *
                </label>
                <input
                  type="number"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline *
                </label>
                <input
                  type="datetime-local"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submission Type *
                </label>
                <select
                  name="submissionType"
                  value={formData.submissionType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="TEXT">Text</option>
                  <option value="PDF">PDF</option>
                  <option value="DOCX">DOCX</option>
                  <option value="ZIP">ZIP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions *
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
