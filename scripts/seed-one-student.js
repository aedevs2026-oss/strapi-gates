'use strict';

/**
 * Seed one complete student with all related ERP data for testing.
 *
 * Usage:
 *   node scripts/seed-one-student.js          # skip if already seeded
 *   node scripts/seed-one-student.js --reset  # delete seed data and recreate
 *
 * Test login (OTP):
 *   POST /api/auth/send-otp  { "mobileNumber": "9876543210" }
 */

require('dotenv').config();

const { createStrapi } = require('@strapi/strapi');

const SEED = {
  parentMobile: '9876543210',
  parentAltMobile: '9876543211',
  parentEmail: 'rajesh.kumar@email.com',
  admissionNumber: 'ADM2026001',
  rollNumber: '12',
  employeeIdClassTeacher: 'SEED-T001',
  employeeIdEnglish: 'SEED-T002',
  employeeIdScience: 'SEED-T003',
};

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const isoDateTime = (daysOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

async function findOne(strapi, uid, filters) {
  return strapi.documents(uid).findFirst({ filters });
}

async function deleteManyByFilter(strapi, uid, filters) {
  const rows = await strapi.documents(uid).findMany({ filters });
  for (const row of rows) {
    await strapi.documents(uid).delete({ documentId: row.documentId });
  }
  return rows.length;
}

async function resetSeedData(strapi) {
  strapi.log.info('[seed] Resetting previous seed data...');

  const parent = await findOne(strapi, 'api::parent.parent', {
    mobileNumber: SEED.parentMobile,
  });

  const student = await findOne(strapi, 'api::student.student', {
    admissionNumber: SEED.admissionNumber,
  });

  const studentId = student?.documentId;

  if (studentId) {
    await deleteManyByFilter(strapi, 'api::attendance.attendance', {
      student: { documentId: studentId },
    });
    await deleteManyByFilter(strapi, 'api::assignment.assignment', {
      student: { documentId: studentId },
    });
    await deleteManyByFilter(strapi, 'api::exam-result.exam-result', {
      student: { documentId: studentId },
    });
    await deleteManyByFilter(strapi, 'api::fee-payment.fee-payment', {
      student: { documentId: studentId },
    });
    await deleteManyByFilter(strapi, 'api::fee.fee', {
      student: { documentId: studentId },
    });
    await strapi.documents('api::student.student').delete({ documentId: studentId });
  }

  if (parent) {
    await deleteManyByFilter(strapi, 'api::notification.notification', {
      targetParent: { documentId: parent.documentId },
    });
    await strapi.documents('api::parent.parent').delete({ documentId: parent.documentId });
  }

  const classRecord = await findOne(strapi, 'api::class.class', { className: 'Class 5 (Seed)' });
  const classId = classRecord?.documentId;

  if (classId) {
    await deleteManyByFilter(strapi, 'api::homework.homework', {
      class: { documentId: classId },
    });
    await deleteManyByFilter(strapi, 'api::timetable.timetable', {
      class: { documentId: classId },
    });
    await deleteManyByFilter(strapi, 'api::circular.circular', {
      title: 'Annual Day 2026 - Class 5',
    });

    const exams = await strapi.documents('api::exam.exam').findMany({
      filters: { class: { documentId: classId } },
    });
    for (const exam of exams) {
      await deleteManyByFilter(strapi, 'api::exam-schedule.exam-schedule', {
        exam: { documentId: exam.documentId },
      });
      await strapi.documents('api::exam.exam').delete({ documentId: exam.documentId });
    }

    await deleteManyByFilter(strapi, 'api::section.section', {
      class: { documentId: classId },
    });
    await strapi.documents('api::class.class').delete({ documentId: classId });
  }

  for (const employeeId of [
    SEED.employeeIdClassTeacher,
    SEED.employeeIdEnglish,
    SEED.employeeIdScience,
  ]) {
    const teacher = await findOne(strapi, 'api::teacher.teacher', { employeeId });
    if (teacher) {
      await strapi.documents('api::teacher.teacher').delete({ documentId: teacher.documentId });
    }
  }

  for (const code of ['SEED-MATH', 'SEED-ENG', 'SEED-SCI', 'SEED-HIN', 'SEED-EVS']) {
    const subject = await findOne(strapi, 'api::subject.subject', { code });
    if (subject) {
      await strapi.documents('api::subject.subject').delete({ documentId: subject.documentId });
    }
  }

  const year = await findOne(strapi, 'api::academic-year.academic-year', { name: '2025-2026 (Seed)' });
  if (year) {
    await strapi.documents('api::academic-year.academic-year').delete({ documentId: year.documentId });
  }

  await deleteManyByFilter(strapi, 'api::holiday.holiday', { holidayName: 'Seed Independence Day' });
  await deleteManyByFilter(strapi, 'api::gallery.gallery', { title: 'Seed Annual Day Gallery' });
  await deleteManyByFilter(strapi, 'api::contact-detail.contact-detail', {
    email: 'office-seed@gates.edu',
  });
  await deleteManyByFilter(strapi, 'api::school.school', { email: 'info-seed@gatesinternational.edu' });
}

async function seedOneStudent(strapi, { reset = false } = {}) {
  if (reset) {
    await resetSeedData(strapi);
  } else {
    const existing = await findOne(strapi, 'api::parent.parent', {
      mobileNumber: SEED.parentMobile,
    });
    if (existing) {
      strapi.log.info(
        `[seed] Data already exists for mobile ${SEED.parentMobile}. Run with --reset to recreate.`
      );
      return printSummary(strapi, existing.documentId);
    }
  }

  strapi.log.info('[seed] Creating complete student test dataset...');

  await strapi.documents('api::school.school').create({
    data: {
      schoolName: 'Gates International School',
      address: '123 Education Lane, New Delhi 110001',
      phone: '+91-11-23456789',
      email: 'info-seed@gatesinternational.edu',
      website: 'https://gatesinternational.edu',
      principal: 'Dr. Sunita Verma',
      brandPrimaryColor: '#5E2A84',
      brandSecondaryColor: '#F4B400',
    },
  });

  const academicYear = await strapi.documents('api::academic-year.academic-year').create({
    data: {
      name: '2025-2026 (Seed)',
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      status: 'active',
    },
  });

  const classTeacher = await strapi.documents('api::teacher.teacher').create({
    data: {
      employeeId: SEED.employeeIdClassTeacher,
      name: 'Mr. Ravi Sharma',
      email: 'ravi.sharma.seed@gates.edu',
      phone: '9876500001',
      qualification: 'M.Sc Mathematics, B.Ed',
    },
  });

  const englishTeacher = await strapi.documents('api::teacher.teacher').create({
    data: {
      employeeId: SEED.employeeIdEnglish,
      name: 'Ms. Ananya Mehta',
      email: 'ananya.mehta.seed@gates.edu',
      phone: '9876500002',
      qualification: 'M.A English, B.Ed',
    },
  });

  const scienceTeacher = await strapi.documents('api::teacher.teacher').create({
    data: {
      employeeId: SEED.employeeIdScience,
      name: 'Mr. Vikram Singh',
      email: 'vikram.singh.seed@gates.edu',
      phone: '9876500003',
      qualification: 'M.Sc Physics, B.Ed',
    },
  });

  const subjects = {};
  const subjectDefs = [
    { name: 'Mathematics', code: 'SEED-MATH', teacher: classTeacher.documentId },
    { name: 'English', code: 'SEED-ENG', teacher: englishTeacher.documentId },
    { name: 'Science', code: 'SEED-SCI', teacher: scienceTeacher.documentId },
    { name: 'Hindi', code: 'SEED-HIN', teacher: classTeacher.documentId },
    { name: 'EVS', code: 'SEED-EVS', teacher: scienceTeacher.documentId },
  ];

  for (const def of subjectDefs) {
    subjects[def.code] = await strapi.documents('api::subject.subject').create({
      data: {
        name: def.name,
        code: def.code,
        description: `${def.name} for Class 5`,
        teachers: [def.teacher],
      },
    });
  }

  const subjectIds = Object.values(subjects).map((s) => s.documentId);

  const classRecord = await strapi.documents('api::class.class').create({
    data: {
      className: 'Class 5 (Seed)',
      classTeacher: classTeacher.documentId,
      academicYear: academicYear.documentId,
      subjects: subjectIds,
    },
  });

  const section = await strapi.documents('api::section.section').create({
    data: {
      name: 'A',
      class: classRecord.documentId,
    },
  });

  const parent = await strapi.documents('api::parent.parent').create({
    data: {
      fatherName: 'Rajesh Kumar',
      motherName: 'Priya Kumar',
      guardianName: null,
      mobileNumber: SEED.parentMobile,
      alternativeMobile: SEED.parentAltMobile,
      email: SEED.parentEmail,
      address: '456 Parent Street, Sector 12, New Delhi 110045',
      blocked: false,
    },
  });

  const student = await strapi.documents('api::student.student').create({
    data: {
      admissionNumber: SEED.admissionNumber,
      rollNumber: SEED.rollNumber,
      studentName: 'Aarav Kumar',
      dob: '2015-03-15',
      gender: 'male',
      bloodGroup: 'B+',
      class: classRecord.documentId,
      section: section.documentId,
      parent: parent.documentId,
      admissionDate: '2025-04-01',
      status: 'active',
    },
  });

  // Attendance — last 10 school days
  const attendancePattern = [
    'present',
    'present',
    'late',
    'present',
    'absent',
    'present',
    'present',
    'half_day',
    'present',
    'present',
  ];
  for (let i = 0; i < attendancePattern.length; i += 1) {
    await strapi.documents('api::attendance.attendance').create({
      data: {
        student: student.documentId,
        date: daysAgo(i + 1),
        status: attendancePattern[i],
        remarks: attendancePattern[i] === 'late' ? 'Arrived 15 minutes late' : null,
      },
    });
  }

  // Timetable — Mon–Fri sample
  const timetableSlots = [
    { day: 'monday', period: 1, subject: 'SEED-MATH', teacher: classTeacher.documentId, start: '08:00:00', end: '08:45:00' },
    { day: 'monday', period: 2, subject: 'SEED-ENG', teacher: englishTeacher.documentId, start: '08:45:00', end: '09:30:00' },
    { day: 'monday', period: 3, subject: 'SEED-SCI', teacher: scienceTeacher.documentId, start: '09:45:00', end: '10:30:00' },
    { day: 'tuesday', period: 1, subject: 'SEED-HIN', teacher: classTeacher.documentId, start: '08:00:00', end: '08:45:00' },
    { day: 'tuesday', period: 2, subject: 'SEED-MATH', teacher: classTeacher.documentId, start: '08:45:00', end: '09:30:00' },
    { day: 'wednesday', period: 1, subject: 'SEED-EVS', teacher: scienceTeacher.documentId, start: '08:00:00', end: '08:45:00' },
    { day: 'thursday', period: 1, subject: 'SEED-ENG', teacher: englishTeacher.documentId, start: '08:00:00', end: '08:45:00' },
    { day: 'friday', period: 1, subject: 'SEED-SCI', teacher: scienceTeacher.documentId, start: '08:00:00', end: '08:45:00' },
  ];

  for (const slot of timetableSlots) {
    await strapi.documents('api::timetable.timetable').create({
      data: {
        day: slot.day,
        period: slot.period,
        subject: subjects[slot.subject].documentId,
        teacher: slot.teacher,
        startTime: slot.start,
        endTime: slot.end,
        class: classRecord.documentId,
      },
    });
  }

  // Homework (published)
  const homeworkItems = [
    {
      title: 'Math — Fractions Worksheet',
      subject: 'SEED-MATH',
      teacher: classTeacher.documentId,
      dueDays: 3,
    },
    {
      title: 'English — Essay: My School',
      subject: 'SEED-ENG',
      teacher: englishTeacher.documentId,
      dueDays: 5,
    },
    {
      title: 'Science — Plant Life Cycle Diagram',
      subject: 'SEED-SCI',
      teacher: scienceTeacher.documentId,
      dueDays: 7,
    },
  ];

  for (const hw of homeworkItems) {
    await strapi.documents('api::homework.homework').create({
      data: {
        title: hw.title,
        description: `Complete and submit before the due date. (${hw.title})`,
        subject: subjects[hw.subject].documentId,
        teacher: hw.teacher,
        class: classRecord.documentId,
        dueDate: isoDateTime(hw.dueDays),
        status: 'published',
      },
      status: 'published',
    });
  }

  // Student assignments
  const assignmentItems = [
    {
      title: 'Math Assignment — Decimals',
      teacher: classTeacher.documentId,
      marks: 18,
      maxMarks: 20,
      status: 'graded',
      daysAgo: 2,
    },
    {
      title: 'English Assignment — Reading Comprehension',
      teacher: englishTeacher.documentId,
      marks: null,
      maxMarks: 25,
      status: 'submitted',
      daysAgo: 1,
    },
    {
      title: 'Science Assignment — Solar System Model',
      teacher: scienceTeacher.documentId,
      marks: null,
      maxMarks: 30,
      status: 'pending',
      daysAgo: 0,
    },
  ];

  for (const item of assignmentItems) {
    await strapi.documents('api::assignment.assignment').create({
      data: {
        title: item.title,
        description: item.title,
        teacher: item.teacher,
        student: student.documentId,
        marks: item.marks,
        maxMarks: item.maxMarks,
        status: item.status,
        submissionDate: item.status !== 'pending' ? isoDateTime(-item.daysAgo) : null,
        remarks: item.status === 'graded' ? 'Excellent work!' : null,
      },
    });
  }

  // Exam + schedules + results (with class rank in remarks)
  const exam = await strapi.documents('api::exam.exam').create({
    data: {
      examName: 'Mid Term Examination 2026',
      class: classRecord.documentId,
      academicYear: academicYear.documentId,
    },
  });

  const examResultDefs = [
    { code: 'SEED-MATH', marks: 92, maxMarks: 100, grade: 'A+', rank: 1 },
    { code: 'SEED-ENG', marks: 85, maxMarks: 100, grade: 'A', rank: 2 },
    { code: 'SEED-SCI', marks: 88, maxMarks: 100, grade: 'A+', rank: 1 },
    { code: 'SEED-HIN', marks: 78, maxMarks: 100, grade: 'B+', rank: 3 },
    { code: 'SEED-EVS', marks: 90, maxMarks: 100, grade: 'A+', rank: 1 },
  ];

  for (const [index, result] of examResultDefs.entries()) {
    await strapi.documents('api::exam-schedule.exam-schedule').create({
      data: {
        exam: exam.documentId,
        subject: subjects[result.code].documentId,
        date: daysFromNow(14 + index),
        time: '09:00:00',
        duration: 120,
        durationUnit: 'minutes',
        room: 'Room 5A',
      },
    });

    await strapi.documents('api::exam-result.exam-result').create({
      data: {
        student: student.documentId,
        exam: exam.documentId,
        subject: subjects[result.code].documentId,
        marks: result.marks,
        maxMarks: result.maxMarks,
        grade: result.grade,
        remarks: `Class rank: ${result.rank} | Overall percentage: ${result.marks}%`,
      },
      status: 'published',
    });
  }

  // Fees + payment
  const tuitionFee = await strapi.documents('api::fee.fee').create({
    data: {
      student: student.documentId,
      academicYear: academicYear.documentId,
      feeType: 'Tuition Fee - Term 2',
      totalAmount: 50000,
      discount: 5000,
      paidAmount: 20000,
      pendingAmount: 25000,
      dueDate: daysFromNow(30),
      status: 'partial',
    },
  });

  await strapi.documents('api::fee.fee').create({
    data: {
      student: student.documentId,
      academicYear: academicYear.documentId,
      feeType: 'Transport Fee - Term 2',
      totalAmount: 12000,
      discount: 0,
      paidAmount: 0,
      pendingAmount: 12000,
      dueDate: daysFromNow(45),
      status: 'pending',
    },
  });

  await strapi.documents('api::fee-payment.fee-payment').create({
    data: {
      student: student.documentId,
      fee: tuitionFee.documentId,
      amount: 20000,
      transactionId: `SEED-PAY-${Date.now()}`,
      paymentMethod: 'upi',
      paymentDate: isoDateTime(-10),
      status: 'success',
      receiptNumber: `RCP-SEED-${Date.now()}`,
    },
  });

  // Circular for class
  await strapi.documents('api::circular.circular').create({
    data: {
      title: 'Annual Day 2026 - Class 5',
      description: 'Annual Day rehearsal schedule for Class 5 Section A students.',
      publishDate: isoDateTime(0),
      target: 'specific_class',
      targetClass: classRecord.documentId,
      priority: 'high',
    },
    status: 'published',
  });

  // Notification for parent
  await strapi.documents('api::notification.notification').create({
    data: {
      title: 'Welcome to Gates International School',
      message: 'Your parent portal is ready. Login with your registered mobile number.',
      target: 'specific_parent',
      targetParent: parent.documentId,
      sentDate: isoDateTime(0),
      sent: true,
      dataPayload: { type: 'welcome', studentId: student.documentId },
    },
  });

  // Gallery, holiday, contact
  await strapi.documents('api::gallery.gallery').create({
    data: {
      title: 'Seed Annual Day Gallery',
      description: 'Photos from Annual Day celebration.',
      eventDate: daysAgo(30),
    },
    status: 'published',
  });

  await strapi.documents('api::holiday.holiday').create({
    data: {
      holidayName: 'Seed Independence Day',
      description: 'National holiday — school closed',
      date: '2026-08-15',
      type: 'public',
    },
  });

  await strapi.documents('api::contact-detail.contact-detail').create({
    data: {
      department: 'Main Office',
      contactPerson: 'Reception',
      phone: '+91-11-23456789',
      email: 'office-seed@gates.edu',
      isPrimary: true,
      sortOrder: 1,
    },
  });

  strapi.log.info('[seed] Complete student dataset created successfully.');
  return printSummary(strapi, parent.documentId, student.documentId);
}

async function printSummary(strapi, parentDocumentId, studentDocumentId) {
  const parent = await strapi.documents('api::parent.parent').findOne({
    documentId: parentDocumentId,
    populate: {
      students: {
        populate: ['class', 'section'],
      },
    },
  });

  const student =
    studentDocumentId ||
    parent?.students?.find((s) => s.admissionNumber === SEED.admissionNumber)?.documentId;

  console.log('\n========================================');
  console.log('  SEED DATA — ONE COMPLETE STUDENT');
  console.log('========================================\n');
  console.log('Parent login (OTP):');
  console.log(`  Mobile: ${SEED.parentMobile}`);
  console.log(`  POST   /api/auth/send-otp`);
  console.log(`  POST   /api/auth/verify-otp\n`);
  console.log('Parent profile:');
  console.log(`  Name:   ${parent?.fatherName} / ${parent?.motherName}`);
  console.log(`  Email:  ${parent?.email}`);
  console.log(`  ID:     ${parentDocumentId}\n`);
  console.log('Student:');
  console.log(`  Name:     ${parent?.students?.[0]?.studentName || 'Aarav Kumar'}`);
  console.log(`  Admission: ${SEED.admissionNumber}`);
  console.log(`  Roll:      ${SEED.rollNumber}`);
  console.log(`  Class:     ${parent?.students?.[0]?.class?.className || 'Class 5 (Seed)'}`);
  console.log(`  Section:   ${parent?.students?.[0]?.section?.name || 'A'}`);
  console.log(`  ID:        ${student || '(run seed to create)'}\n`);
  console.log('Includes: school, academic year, teachers, subjects, class,');
  console.log('section, attendance, timetable, homework, assignments,');
  console.log('exam + schedules + results (with rank), fees, payments,');
  console.log('circular, notification, gallery, holiday, contact.\n');
  console.log('Reset & re-seed:  node scripts/seed-one-student.js --reset\n');
}

async function main() {
  const reset = process.argv.includes('--reset');
  const strapi = createStrapi({ appDir: process.cwd() });

  await strapi.load();

  try {
    await seedOneStudent(strapi, { reset });
  } catch (error) {
    strapi.log.error('[seed] Failed:', error);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
}

module.exports = seedOneStudent;

if (require.main === module) {
  main();
}
