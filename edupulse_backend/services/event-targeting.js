const User = require("../models/User");

function buildVisibilityQueryForUser(user) {
  const query = { isCancelled: { $ne: true } };

  if (user.role === "ADMIN") {
    // Admins see all non-cancelled events
    return query;
  }

  if (user.role === "TUTOR") {
    query.$or = [
      // Events targeting all tutors
      { targetType: "TUTORS_ALL" },
      // Events targeting tutors in their faculty
      { targetType: "TUTORS_FACULTY", targetFaculty: user.faculty },
      // Events targeting everyone
      { targetType: "EVERYONE" },
      // Events targeting their faculty
      { targetType: "FACULTY", targetFaculty: user.faculty },
      // Events targeting their year/semester
      { targetType: "YEAR_SEM", targetYear: user.year, targetSemester: user.semester },
      // Events targeting their faculty/year/semester
      { 
        targetType: "FACULTY_YEAR_SEM", 
        targetFaculty: user.faculty, 
        targetYear: user.year, 
        targetSemester: user.semester 
      },
    ];
    return query;
  }

  if (user.role === "STUDENT") {
    query.$or = [
      // Events targeting all students
      { targetType: "STUDENTS_ALL" },
      // Events targeting students in their faculty
      { targetType: "STUDENTS_FACULTY", targetFaculty: user.faculty },
      // Events targeting students in their faculty/year
      { targetType: "STUDENTS_FACULTY_YEAR", targetFaculty: user.faculty, targetYear: user.year },
      // Events targeting students in their faculty/year/semester
      { 
        targetType: "STUDENTS_FACULTY_YEAR_SEMESTER", 
        targetFaculty: user.faculty, 
        targetYear: user.year, 
        targetSemester: user.semester 
      },
      // Events targeting everyone
      { targetType: "EVERYONE" },
      // Events targeting their faculty
      { targetType: "FACULTY", targetFaculty: user.faculty },
      // Events targeting their year/semester
      { targetType: "YEAR_SEM", targetYear: user.year, targetSemester: user.semester },
      // Events targeting their faculty/year/semester
      { 
        targetType: "FACULTY_YEAR_SEM", 
        targetFaculty: user.faculty, 
        targetYear: user.year, 
        targetSemester: user.semester 
      },
    ];
    return query;
  }

  // Default: no events for unknown roles
  return { _id: null };
}

async function getRecipientUsersForEvent(event) {
  const query = { role: { $in: ["STUDENT", "TUTOR", "ADMIN"] } };

  switch (event.targetType) {
    case "EVERYONE":
      // All users
      break;

    case "STUDENTS_ALL":
      query.role = "STUDENT";
      break;

    case "TUTORS_ALL":
      query.role = "TUTOR";
      break;

    case "STUDENTS_FACULTY":
    case "TUTORS_FACULTY":
    case "FACULTY":
      query.role = event.targetType.includes("STUDENT") ? "STUDENT" : 
                 event.targetType.includes("TUTOR") ? "TUTOR" : 
                 { $in: ["STUDENT", "TUTOR"] };
      query.faculty = event.targetFaculty;
      break;

    case "STUDENTS_FACULTY_YEAR":
      query.role = "STUDENT";
      query.faculty = event.targetFaculty;
      query.year = event.targetYear;
      break;

    case "STUDENTS_FACULTY_YEAR_SEMESTER":
      query.role = "STUDENT";
      query.faculty = event.targetFaculty;
      query.year = event.targetYear;
      query.semester = event.targetSemester;
      break;

    case "YEAR_SEM":
      query.year = event.targetYear;
      query.semester = event.targetSemester;
      break;

    case "FACULTY_YEAR_SEM":
      query.faculty = event.targetFaculty;
      query.year = event.targetYear;
      query.semester = event.targetSemester;
      break;

    default:
      return [];
  }

  return await User.find(query).select("_id role faculty year semester").lean();
}

module.exports = {
  buildVisibilityQueryForUser,
  getRecipientUsersForEvent,
};
