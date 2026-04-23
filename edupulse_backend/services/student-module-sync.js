const User = require("../models/User");
const StudentModule = require("../models/StudentModule");
const { Module } = require("../models/Module");

async function syncStudentsForModule(moduleItem) {
  try {
    // Find all students that match the module's faculty, year, and semester
    const students = await User.find({
      role: "STUDENT",
      faculty: moduleItem.faculty,
      year: moduleItem.year,
      semester: moduleItem.semester,
    }).select("_id");

    if (students.length === 0) {
      console.log(`No students found for module ${moduleItem.moduleCode}`);
      return;
    }

    // Create student-module relationships
    const studentModules = students.map((student) => ({
      student: student._id,
      module: moduleItem._id,
    }));

    // Remove existing relationships and create new ones
    await StudentModule.deleteMany({ module: moduleItem._id });
    await StudentModule.insertMany(studentModules);

    console.log(`Synced ${students.length} students for module ${moduleItem.moduleCode}`);
  } catch (err) {
    console.error(`Error syncing students for module ${moduleItem.moduleCode}:`, err);
    throw err;
  }
}

async function resyncModulesForAcademicGroup(moduleItem, previousAcademicGroup) {
  try {
    // If faculty, year, or semester changed, we need to resync
    const academicGroupChanged = 
      moduleItem.faculty !== previousAcademicGroup.faculty ||
      moduleItem.year !== previousAcademicGroup.year ||
      moduleItem.semester !== previousAcademicGroup.semester;

    if (!academicGroupChanged) {
      return;
    }

    // Remove old student assignments
    await StudentModule.deleteMany({ module: moduleItem._id });

    // Add new student assignments based on updated module details
    await syncStudentsForModule(moduleItem);

    console.log(`Resynced students for module ${moduleItem.moduleCode} due to academic group change`);
  } catch (err) {
    console.error(`Error resyncing modules for academic group:`, err);
    throw err;
  }
}

module.exports = {
  syncStudentsForModule,
  resyncModulesForAcademicGroup,
};
