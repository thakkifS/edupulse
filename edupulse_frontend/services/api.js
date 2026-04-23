import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// ==================== ASSIGNMENT APIS ====================
export const assignmentAPI = {
  // List assignments
  listAssignments: (moduleName) => {
    const params = moduleName ? { moduleName } : {};
    return api.get('/assignments', { params });
  },

  // Create assignment
  createAssignment: (assignmentData) => {
    return api.post('/assignments', assignmentData);
  },

  // Get assignment by ID
  getAssignment: (id) => {
    return api.get(`/assignments/${id}`);
  },

  // Update assignment
  updateAssignment: (id, assignmentData) => {
    return api.put(`/assignments/${id}`, assignmentData);
  },

  // Delete assignment
  deleteAssignment: (id) => {
    return api.delete(`/assignments/${id}`);
  },

  // Publish assignment
  publishAssignment: (id) => {
    return api.post(`/assignments/${id}/publish`);
  },

  // Close assignment
  closeAssignment: (id) => {
    return api.post(`/assignments/${id}/close`);
  },

  // Submit assignment
  submitAssignment: (id, submissionData) => {
    return api.post(`/assignments/${id}/submit`, submissionData);
  },

  // Get submissions overview
  getSubmissionsOverview: (id) => {
    return api.get(`/assignments/${id}/submissions`);
  },

  // Review submission
  reviewSubmission: (id, submissionId, reviewData) => {
    return api.post(`/assignments/${id}/submissions/${submissionId}/review`, reviewData);
  },
};

// ==================== EVENT APIS ====================
export const eventAPI = {
  // List events
  listEvents: () => {
    return api.get('/events');
  },

  // Create event
  createEvent: (eventData) => {
    return api.post('/events', eventData);
  },

  // Update event
  updateEvent: (id, eventData) => {
    return api.put(`/events/${id}`, eventData);
  },

  // Delete event
  deleteEvent: (id) => {
    return api.delete(`/events/${id}`);
  },
};

// ==================== FEEDBACK APIS ====================
export const feedbackAPI = {
  // List feedbacks
  listFeedbacks: () => {
    return api.get('/feedbacks');
  },

  // Create feedback
  createFeedback: (feedbackData) => {
    return api.post('/feedbacks', feedbackData);
  },

  // Update feedback
  updateFeedback: (id, feedbackData) => {
    return api.put(`/feedbacks/${id}`, feedbackData);
  },

  // Delete feedback
  deleteFeedback: (id) => {
    return api.delete(`/feedbacks/${id}`);
  },
};

// ==================== MODULE APIS ====================
export const moduleAPI = {
  // List modules
  listModules: (filters) => {
    const params = filters || {};
    return api.get('/modules', { params });
  },

  // Create module
  createModule: (moduleData) => {
    return api.post('/modules', moduleData);
  },

  // Get module by ID
  getModule: (id) => {
    return api.get(`/modules/${id}`);
  },

  // Update module
  updateModule: (id, moduleData) => {
    return api.put(`/modules/${id}`, moduleData);
  },

  // Delete module
  deleteModule: (id) => {
    return api.delete(`/modules/${id}`);
  },

  // Calculate module results
  calculateResults: (id) => {
    return api.post(`/modules/${id}/results/calculate`);
  },

  // List module results
  listResults: (id) => {
    return api.get(`/modules/${id}/results`);
  },

  // Publish module results
  publishResults: (id) => {
    return api.post(`/modules/${id}/results/publish`);
  },

  // Get my module results
  getMyResults: () => {
    return api.get('/modules/my/results');
  },
};

// ==================== NOTIFICATION APIS ====================
export const notificationAPI = {
  // List notifications
  listNotifications: () => {
    return api.get('/notifications');
  },

  // Get unread count
  getUnreadCount: () => {
    return api.get('/notifications/unread-count');
  },

  // Mark as read
  markAsRead: (id) => {
    return api.patch(`/notifications/${id}/read`);
  },

  // Mark all as read
  markAllAsRead: () => {
    return api.patch('/notifications/read-all');
  },

  // Get notification event
  getNotificationEvent: (id) => {
    return api.get(`/notifications/${id}/event`);
  },

  // Send reminder (email)
  sendReminder: (reminderData) => {
    return api.post('/notifications/reminder', reminderData);
  },
};

// ==================== QUIZ APIS ====================
export const quizAPI = {
  // List quizzes
  listQuizzes: (moduleName) => {
    const params = moduleName ? { moduleName } : {};
    return api.get('/quizzes', { params });
  },

  // Create quiz
  createQuiz: (quizData) => {
    return api.post('/quizzes', quizData);
  },

  // Get quiz by ID
  getQuiz: (id) => {
    return api.get(`/quizzes/${id}`);
  },

  // Update quiz
  updateQuiz: (id, quizData) => {
    return api.put(`/quizzes/${id}`, quizData);
  },

  // Delete quiz
  deleteQuiz: (id) => {
    return api.delete(`/quizzes/${id}`);
  },

  // Publish quiz
  publishQuiz: (id) => {
    return api.post(`/quizzes/${id}/publish`);
  },

  // Start quiz attempt
  startAttempt: (id) => {
    return api.post(`/quizzes/${id}/attempts/start`);
  },

  // Submit quiz attempt
  submitAttempt: (id, attemptId, answers) => {
    return api.post(`/quizzes/${id}/attempts/${attemptId}/submit`, { answers });
  },

  // Get quiz attempts overview
  getAttemptsOverview: (id) => {
    return api.get(`/quizzes/${id}/attempts`);
  },

  // Review quiz attempt
  reviewAttempt: (id, attemptId, reviewData) => {
    return api.post(`/quizzes/${id}/attempts/${attemptId}/review`, reviewData);
  },
};

// ==================== EXISTING APIS (Enhanced) ====================
export const authAPI = {
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  forgotPassword: (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: (token, newPassword) => {
    return api.post('/auth/reset-password', { token, newPassword });
  },
};

export const userAPI = {
  getProfile: () => {
    return api.get('/users/profile');
  },

  updateProfile: (profileData) => {
    return api.put('/users/profile', profileData);
  },

  listUsers: () => {
    return api.get('/users');
  },
};

export const bookAPI = {
  listBooks: () => {
    return api.get('/Book');
  },

  addBook: (bookData) => {
    return api.post('/Book', bookData);
  },

  getBook: (id) => {
    return api.get(`/Book/${id}`);
  },

  updateBook: (id, bookData) => {
    return api.put(`/Book/${id}`, bookData);
  },

  deleteBook: (id) => {
    return api.delete(`/Book/${id}`);
  },
};

export const careerAPI = {
  listCareers: () => {
    return api.get('/careers');
  },

  addCareer: (careerData) => {
    return api.post('/careers', careerData);
  },

  getCareer: (id) => {
    return api.get(`/careers/${id}`);
  },
};

export const cvAPI = {
  listCVs: () => {
    return api.get('/cv');
  },

  createCV: (cvData) => {
    return api.post('/cv', cvData);
  },

  getCV: (id) => {
    return api.get(`/cv/${id}`);
  },

  updateCV: (id, cvData) => {
    return api.put(`/cv/${id}`, cvData);
  },

  deleteCV: (id) => {
    return api.delete(`/cv/${id}`);
  },

  downloadCV: (id) => {
    return api.get(`/cv/${id}/download`, { responseType: 'blob' });
  },
};

export const skillAPI = {
  listSkills: () => {
    return api.get('/skills');
  },

  addSkill: (skillData) => {
    return api.post('/skills', skillData);
  },

  updateSkill: (id, skillData) => {
    return api.put(`/skills/${id}`, skillData);
  },

  deleteSkill: (id) => {
    return api.delete(`/skills/${id}`);
  },
};

export const chatAPI = {
  getMessages: () => {
    return api.get('/chat');
  },

  sendMessage: (messageData) => {
    return api.post('/chat', messageData);
  },
};

export const schedulerAPI = {
  getSchedule: () => {
    return api.get('/scheduler');
  },

  createSchedule: (scheduleData) => {
    return api.post('/scheduler', scheduleData);
  },

  updateSchedule: (id, scheduleData) => {
    return api.put(`/scheduler/${id}`, scheduleData);
  },

  deleteSchedule: (id) => {
    return api.delete(`/scheduler/${id}`);
  },
};

// ==================== UTILITY FUNCTIONS ====================
export const apiUtils = {
  // Handle file upload (convert to base64)
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  },

  // Format date for API
  formatDate: (date) => {
    return date.toISOString();
  },

  // Handle API errors
  handleError: (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', error);
    return message;
  },

  // Check if user has specific role
  hasRole: (user, requiredRole) => {
    return user?.role === requiredRole;
  },

  // Check if user can access resource
  canAccess: (user, resource) => {
    if (user?.role === 'ADMIN') return true;
    if (resource?.createdBy === user?._id) return true;
    if (user?.role === 'TUTOR' && resource?.assignedTutor === user?._id) return true;
    return false;
  },
};

export default api;
