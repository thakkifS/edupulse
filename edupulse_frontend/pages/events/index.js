import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/AuthContext';
import { eventAPI, apiUtils } from '../../services/api';
import HeaderDiffer from '../../components/HeaderDiffer';

export default function EventsPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.listEvents();
      setEvents(response.data.events || []);
    } catch (err) {
      setError(apiUtils.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    if (user.role === 'STUDENT') {
      alert('Students cannot create events.');
      return;
    }
    setShowCreateModal(true);
  };

  const handleEditEvent = (event) => {
    if (!apiUtils.canAccess(user, event)) {
      alert('You can only edit your own events.');
      return;
    }
    router.push(`/events/${event._id}/edit`);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to cancel this event?')) return;
    
    try {
      await eventAPI.deleteEvent(eventId);
      fetchEvents();
    } catch (err) {
      setError(apiUtils.handleError(err));
    }
  };

  const getEventStatus = (event) => {
    if (event.isCancelled) return { status: 'CANCELLED', color: 'red', text: 'Cancelled' };
    
    const now = new Date();
    const eventDate = new Date(event.startsAt);
    
    if (eventDate < now) {
      return { status: 'PAST', color: 'gray', text: 'Past Event' };
    }
    
    return { status: 'UPCOMING', color: 'green', text: 'Upcoming' };
  };

  const getTargetTypeLabel = (targetType) => {
    const labels = {
      'EVERYONE': 'Everyone',
      'STUDENTS_ALL': 'All Students',
      'STUDENTS_FACULTY': 'Students (Faculty)',
      'STUDENTS_FACULTY_YEAR': 'Students (Faculty/Year)',
      'STUDENTS_FACULTY_YEAR_SEMESTER': 'Students (Faculty/Year/Semester)',
      'TUTORS_ALL': 'All Tutors',
      'TUTORS_FACULTY': 'Tutors (Faculty)',
      'FACULTY': 'Faculty',
      'YEAR_SEM': 'Year/Semester',
      'FACULTY_YEAR_SEM': 'Faculty/Year/Semester'
    };
    return labels[targetType] || targetType;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to access events.</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
              <p className="text-gray-600">View and manage upcoming events</p>
            </div>
            {(user.role === 'ADMIN' || user.role === 'TUTOR') && (
              <button
                onClick={handleCreateEvent}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Event
              </button>
            )}
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
                <span className="ml-2 text-gray-600">Loading events...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const eventStatus = getEventStatus(event);
                return (
                  <div key={event._id} className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 ${
                    event.isCancelled ? 'opacity-75' : ''
                  }`}>
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full bg-${eventStatus.color}-100 text-${eventStatus.color}-800`}>
                          {eventStatus.text}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600">
                          {new Date(event.startsAt).toLocaleDateString()} at {new Date(event.startsAt).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-600">{event.location}</span>
                      </div>

                      <div className="flex items-center text-sm">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-gray-600">{getTargetTypeLabel(event.targetType)}</span>
                      </div>

                      {event.targetFaculty && (
                        <div className="flex items-center text-sm">
                          <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-gray-600">
                            {event.targetFaculty}
                            {event.targetYear && ` - Year ${event.targetYear}`}
                            {event.targetSemester && ` - Sem ${event.targetSemester}`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {(user.role === 'ADMIN' || user.role === 'TUTOR') && (
                        <>
                          {apiUtils.canAccess(user, event) && (
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="flex-1 bg-blue-100 text-blue-700 py-1 px-2 rounded text-sm hover:bg-blue-200 transition-colors"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteEvent(event._id)}
                            className="flex-1 bg-red-100 text-red-700 py-1 px-2 rounded text-sm hover:bg-red-200 transition-colors"
                          >
                            {event.isCancelled ? 'Delete' : 'Cancel'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && events.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">
                {(user.role === 'ADMIN' || user.role === 'TUTOR') 
                  ? 'Get started by creating your first event.' 
                  : 'There are no upcoming events at the moment.'}
              </p>
              {(user.role === 'ADMIN' || user.role === 'TUTOR') && (
                <button
                  onClick={handleCreateEvent}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Event
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchEvents();
          }}
        />
      )}
    </>
  );
}

// Create Event Modal Component
function CreateEventModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startsAt: '',
    location: '',
    targetType: 'EVERYONE',
    targetFaculty: '',
    targetYear: '',
    targetSemester: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      await eventAPI.createEvent({
        ...formData,
        startsAt: new Date(formData.startsAt).toISOString()
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

  const getTargetTypeOptions = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.role === 'TUTOR') {
      return [
        { value: 'STUDENTS_ALL', label: 'All Students' },
        { value: 'STUDENTS_FACULTY', label: 'Students (Faculty)' },
        { value: 'STUDENTS_FACULTY_YEAR', label: 'Students (Faculty/Year)' },
        { value: 'STUDENTS_FACULTY_YEAR_SEMESTER', label: 'Students (Faculty/Year/Semester)' },
        { value: 'FACULTY', label: 'Faculty' },
        { value: 'YEAR_SEM', label: 'Year/Semester' },
        { value: 'FACULTY_YEAR_SEM', label: 'Faculty/Year/Semester' }
      ];
    }
    
    return [
      { value: 'EVERYONE', label: 'Everyone' },
      { value: 'STUDENTS_ALL', label: 'All Students' },
      { value: 'STUDENTS_FACULTY', label: 'Students (Faculty)' },
      { value: 'STUDENTS_FACULTY_YEAR', label: 'Students (Faculty/Year)' },
      { value: 'STUDENTS_FACULTY_YEAR_SEMESTER', label: 'Students (Faculty/Year/Semester)' },
      { value: 'TUTORS_ALL', label: 'All Tutors' },
      { value: 'TUTORS_FACULTY', label: 'Tutors (Faculty)' },
      { value: 'FACULTY', label: 'Faculty' },
      { value: 'YEAR_SEM', label: 'Year/Semester' },
      { value: 'FACULTY_YEAR_SEM', label: 'Faculty/Year/Semester' }
    ];
  };

  const showTargetFields = () => {
    const type = formData.targetType;
    return type.includes('FACULTY') || type.includes('YEAR') || type.includes('SEMESTER');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Event</h2>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="startsAt"
                  value={formData.startsAt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience *
                </label>
                <select
                  name="targetType"
                  value={formData.targetType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {getTargetTypeOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {showTargetFields() && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.targetType.includes('FACULTY') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Faculty
                    </label>
                    <input
                      type="text"
                      name="targetFaculty"
                      value={formData.targetFaculty}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Faculty of Computing"
                    />
                  </div>
                )}

                {formData.targetType.includes('YEAR') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      name="targetYear"
                      value={formData.targetYear}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Year</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                )}

                {formData.targetType.includes('SEMESTER') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester
                    </label>
                    <select
                      name="targetSemester"
                      value={formData.targetSemester}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Semester</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                    </select>
                  </div>
                )}
              </div>
            )}

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
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
