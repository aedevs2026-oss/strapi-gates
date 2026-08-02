'use strict';

/**
 * Seeds a sample teacher with assignments for mobile app testing.
 * Run: node scripts/seed-teacher.js
 */
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

async function main() {
  console.log('Seed teacher data via Strapi admin or documents API.');
  console.log('');
  console.log('Required records:');
  console.log('1. Teacher — mobile: 9876543210, employeeId: T001, status: active');
  console.log('2. Class — e.g. Grade 5 Section A');
  console.log('3. Subject — e.g. Mathematics (MATH)');
  console.log('4. Academic Year — status: active');
  console.log('5. TeacherAssignment — link teacher + class + subject + academicYear');
  console.log('6. Class.classIncharges — add teacher for Class Incharge role');
  console.log('');
  console.log('Then login with OTP_DEV_MODE=true at POST /api/teacher-auth/send-otp');
}

main();
