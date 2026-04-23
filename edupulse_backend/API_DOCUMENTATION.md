# EduPulse Backend API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Assignment Management APIs

### 1. List Assignments
```
GET /api/assignments
```
**Query Parameters:**
- `moduleName` (optional): Filter by module name

**Response:**
```json
{
  "assignments": [
    {
      "_id": "assignment_id",
      "title": "Assignment Title",
      "description": "Assignment description",
      "moduleName": "Module Name",
      "totalMarks": 100,
      "deadline": "2024-01-15T23:59:59.000Z",
      "submissionType": "PDF|DOCX|ZIP|TEXT",
      "instructions": "Assignment instructions",
      "status": "PUBLISHED|DRAFT",
      "isClosed": false,
      "createdBy": { "user_info" },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "mySubmission": { "submission_info" } // Only for students
    }
  ]
}
```

### 2. Create Assignment
```
POST /api/assignments
```
**Body:**
```json
{
  "title": "Assignment Title",
  "description": "Assignment description",
  "moduleName": "Module Name",
  "totalMarks": 100,
  "deadline": "2024-01-15T23:59:59.000Z",
  "submissionType": "PDF|DOCX|ZIP|TEXT",
  "instructions": "Assignment instructions",
  "status": "PUBLISHED|DRAFT"
}
```

### 3. Get Assignment by ID
```
GET /api/assignments/:id
```

### 4. Update Assignment
```
PUT /api/assignments/:id
```
**Body:** Same as create assignment

### 5. Delete Assignment
```
DELETE /api/assignments/:id
```

### 6. Publish Assignment
```
POST /api/assignments/:id/publish
```

### 7. Close Assignment
```
POST /api/assignments/:id/close
```

### 8. Submit Assignment
```
POST /api/assignments/:id/submit
```
**Body:**
```json
{
  "submissionText": "Text submission (if TEXT type)",
  "attachmentUrl": "data:application/pdf;base64,<base64_data>",
  "attachmentName": "filename.pdf"
}
```

### 9. Get Assignment Submissions Overview
```
GET /api/assignments/:id/submissions
```

### 10. Review Assignment Submission
```
POST /api/assignments/:id/submissions/:submissionId/review
```
**Body:**
```json
{
  "criteriaScores": [
    {
      "criterion": "Criterion Name",
      "marksAwarded": 85,
      "comment": "Feedback comment"
    }
  ],
  "totalMarksAwarded": 85,
  "comments": "Overall comments",
  "overallFeedback": "Overall feedback"
}
```

---

## Event Management APIs

### 1. List Events
```
GET /api/events
```

### 2. Create Event
```
POST /api/events
```
**Body:**
```json
{
  "title": "Event Title",
  "description": "Event description",
  "startsAt": "2024-01-15T10:00:00.000Z",
  "location": "Event Location",
  "targetType": "EVERYONE|STUDENTS_ALL|STUDENTS_FACULTY|STUDENTS_FACULTY_YEAR|STUDENTS_FACULTY_YEAR_SEMESTER|TUTORS_ALL|TUTORS_FACULTY|FACULTY|YEAR_SEM|FACULTY_YEAR_SEM",
  "targetFaculty": "Faculty Name (if required)",
  "targetYear": 1,
  "targetSemester": 1
}
```

### 3. Update Event
```
PUT /api/events/:id
```
**Body:** Same as create event

### 4. Delete Event
```
DELETE /api/events/:id
```

---

## Feedback APIs

### 1. List Feedbacks
```
GET /api/feedbacks
```

### 2. Create Feedback
```
POST /api/feedbacks
```
**Body:**
```json
{
  "subject": "Feedback Subject",
  "message": "Feedback message"
}
```

### 3. Update Feedback
```
PUT /api/feedbacks/:id
```
**Body:** Same as create feedback

### 4. Delete Feedback
```
DELETE /api/feedbacks/:id
```

---

## Module Management APIs

### 1. List Modules
```
GET /api/modules
```
**Query Parameters:**
- `faculty` (optional): Filter by faculty
- `year` (optional): Filter by year
- `semester` (optional): Filter by semester

### 2. Create Module
```
POST /api/modules
```
**Body:**
```json
{
  "name": "Module Name",
  "faculty": "Faculty of Computing",
  "year": 1,
  "semester": 1,
  "description": "Module description",
  "assignedTutor": "tutor_id_or_userId"
}
```

### 3. Get Module by ID
```
GET /api/modules/:id
```

### 4. Update Module
```
PUT /api/modules/:id
```
**Body:** Same as create module

### 5. Delete Module
```
DELETE /api/modules/:id
```

### 6. Calculate Module Results
```
POST /api/modules/:id/results/calculate
```

### 7. List Module Results
```
GET /api/modules/:id/results
```

### 8. Publish Module Results
```
POST /api/modules/:id/results/publish
```

### 9. List My Module Results
```
GET /api/modules/my/results
```

---

## Notification APIs

### 1. List My Notifications
```
GET /api/notifications
```

### 2. Get Unread Count
```
GET /api/notifications/unread-count
```

### 3. Mark Notification as Read
```
PATCH /api/notifications/:id/read
```

### 4. Mark All Notifications as Read
```
PATCH /api/notifications/read-all
```

### 5. Get Notification Event
```
GET /api/notifications/:id/event
```

### 6. Send Reminder (Email)
```
POST /api/notifications/reminder
```
**Body:**
```json
{
  "toEmail": "recipient@example.com",
  "subject": "Email Subject",
  "message": "Email message"
}
```

---

## Quiz Management APIs

### 1. List Quizzes
```
GET /api/quizzes
```
**Query Parameters:**
- `moduleName` (optional): Filter by module name

### 2. Create Quiz
```
POST /api/quizzes
```
**Body:**
```json
{
  "title": "Quiz Title",
  "description": "Quiz description",
  "moduleName": "Module Name",
  "totalMarks": 100,
  "deadline": "2024-01-15T23:59:59.000Z",
  "instructions": "Quiz instructions",
  "status": "PUBLISHED|DRAFT",
  "questions": [
    {
      "questionType": "MCQ|TRUE_FALSE|SHORT_ANSWER|FILL_IN_THE_BLANKS",
      "questionText": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "marks": 10,
      "topicCategory": "Category"
    }
  ]
}
```

### 3. Get Quiz by ID
```
GET /api/quizzes/:id
```

### 4. Update Quiz
```
PUT /api/quizzes/:id
```
**Body:** Same as create quiz

### 5. Delete Quiz
```
DELETE /api/quizzes/:id
```

### 6. Publish Quiz
```
POST /api/quizzes/:id/publish
```

### 7. Start Quiz Attempt
```
POST /api/quizzes/:id/attempts/start
```

### 8. Submit Quiz Attempt
```
POST /api/quizzes/:id/attempts/:attemptId/submit
```
**Body:**
```json
{
  "answers": [
    {
      "questionId": "question_id",
      "answer": "Student's answer"
    }
  ]
}
```

### 9. Get Quiz Attempts Overview
```
GET /api/quizzes/:id/attempts
```

### 10. Review Quiz Attempt
```
POST /api/quizzes/:id/attempts/:attemptId/review
```
**Body:**
```json
{
  "answers": [
    {
      "questionId": "question_id",
      "marksAwarded": 8,
      "reviewComment": "Review comment"
    }
  ],
  "overallFeedback": "Overall feedback"
}
```

---

## Existing APIs (From Your Codebase)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - List users (admin only)

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - User management
- `POST /api/admin/users/:id/approve` - Approve user

### Books
- `GET /api/books` - List books
- `POST /api/books` - Add book
- `GET /api/books/:id` - Get book details
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Career
- `GET /api/career` - List career paths
- `POST /api/career` - Add career path
- `GET /api/career/:id` - Get career details

### CV/Resume
- `GET /api/cv` - List CVs
- `POST /api/cv` - Create CV
- `GET /api/cv/:id` - Get CV details
- `PUT /api/cv/:id` - Update CV
- `DELETE /api/cv/:id` - Delete CV

### Skills
- `GET /api/skills` - List skills
- `POST /api/skills` - Add skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

### Chat
- `GET /api/chat` - Get chat messages
- `POST /api/chat` - Send message

### Scheduler
- `GET /api/scheduler` - Get scheduled items
- `POST /api/scheduler` - Create schedule
- `PUT /api/scheduler/:id` - Update schedule
- `DELETE /api/scheduler/:id` - Delete schedule

---

## Testing Examples

### Using curl:

#### 1. Login to get token
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'
```

#### 2. List assignments (with token)
```bash
curl -X GET http://localhost:3001/api/assignments \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### 3. Create assignment
```bash
curl -X POST http://localhost:3001/api/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "title": "Test Assignment",
    "description": "Test description",
    "moduleName": "Programming Fundamentals",
    "totalMarks": 100,
    "deadline": "2024-12-31T23:59:59.000Z",
    "submissionType": "PDF",
    "instructions": "Complete the assignment",
    "status": "PUBLISHED"
  }'
```

### Using Postman:
1. Import the collection below
2. Set base URL: `http://localhost:3001/api`
3. Add authentication header with your JWT token
4. Test endpoints according to their HTTP methods

---

## Error Responses

All endpoints return consistent error responses:
```json
{
  "message": "Error description",
  "error": "Detailed error information (optional)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Rate Limiting & Security

- All protected endpoints require valid JWT token
- Token expiration: 24 hours (configurable)
- Rate limiting may be implemented on sensitive endpoints
- Input validation on all endpoints
- File upload size limits apply (configurable)

---

## Testing Checklist

### Assignment Management:
- [ ] Create assignment
- [ ] List assignments (tutor view)
- [ ] List assignments (student view)
- [ ] Submit assignment
- [ ] Grade assignment
- [ ] Publish/close assignment

### Event Management:
- [ ] Create event with different target types
- [ ] List events (role-based filtering)
- [ ] Update event
- [ ] Cancel event

### Quiz Management:
- [ ] Create quiz with multiple question types
- [ ] Start quiz attempt
- [ ] Submit quiz
- [ ] Review quiz answers
- [ ] Auto-grading functionality

### Module Management:
- [ ] Create module
- [ ] Calculate results
- [ ] Publish results
- [ ] Student result viewing

### Notifications:
- [ ] Create notifications
- [ ] Mark as read
- [ ] Get unread count
- [ ] Event notifications

---

## Notes

1. **File Uploads**: Assignment submissions use base64 encoding for file uploads
2. **Role-based Access**: Different endpoints available based on user role (ADMIN, TUTOR, STUDENT)
3. **Automatic Notifications**: System automatically creates notifications for assignments, quizzes, events, and results
4. **Data Validation**: All endpoints include comprehensive input validation
5. **Error Handling**: Consistent error response format across all endpoints
