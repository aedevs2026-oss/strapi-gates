'use strict';

/**
 * Development seed script.
 * Run after first admin setup: node scripts/seed-dev-data.js
 *
 * Requires Strapi to be running OR use strapi console:
 * npm run console
 * > .load scripts/seed-dev-data.js
 */

async function seedDevData(strapi) {
  strapi.log.info('Seeding development data...');

  await strapi.documents('api::school.school').create({
    data: {
      schoolName: 'Gates International School',
      address: '123 Education Lane, New Delhi 110001',
      phone: '+91-11-23456789',
      email: 'info@gatesinternational.edu',
      website: 'https://gatesinternational.edu',
      principal: 'Dr. Sunita Verma',
      brandPrimaryColor: '#5E2A84',
      brandSecondaryColor: '#F4B400',
    },
  });

  const academicYear = await strapi.documents('api::academic-year.academic-year').create({
    data: {
      name: '2025-2026',
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      status: 'active',
    },
  });

  const teacher = await strapi.documents('api::teacher.teacher').create({
    data: {
      employeeId: 'T001',
      name: 'Mr. Ravi Sharma',
      email: 'ravi.sharma@gates.edu',
      phone: '9876500001',
      qualification: 'M.Sc Mathematics',
    },
  });

  const subject = await strapi.documents('api::subject.subject').create({
    data: {
      name: 'Mathematics',
      code: 'MATH5',
    },
  });

  const classRecord = await strapi.documents('api::class.class').create({
    data: {
      className: 'Class 5',
      classTeacher: teacher.documentId,
      academicYear: academicYear.documentId,
      subjects: [subject.documentId],
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
      mobileNumber: '9876543210',
      email: 'rajesh.kumar@email.com',
      address: '456 Parent Street, New Delhi',
    },
  });

  const student = await strapi.documents('api::student.student').create({
    data: {
      admissionNumber: 'ADM2024001',
      rollNumber: '12',
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

  await strapi.documents('api::fee.fee').create({
    data: {
      student: student.documentId,
      academicYear: academicYear.documentId,
      feeType: 'Tuition Fee - Term 2',
      totalAmount: 50000,
      discount: 5000,
      paidAmount: 20000,
      pendingAmount: 25000,
      dueDate: '2026-04-15',
      status: 'partial',
    },
  });

  await strapi.documents('api::contact-detail.contact-detail').create({
    data: {
      department: 'Main Office',
      contactPerson: 'Reception',
      phone: '+91-11-23456789',
      email: 'office@gates.edu',
      isPrimary: true,
      sortOrder: 1,
    },
  });

  await strapi.documents('api::holiday.holiday').create({
    data: {
      holidayName: 'Independence Day',
      description: 'National Holiday',
      date: '2026-08-15',
      type: 'public',
    },
  });

  strapi.log.info('Seed complete. Test login with mobile: 9876543210');
}

module.exports = seedDevData;

if (require.main === module) {
  const Strapi = require('@strapi/strapi');
  Strapi().load().then(async (strapi) => {
    await seedDevData(strapi);
    await strapi.destroy();
    process.exit(0);
  });
}
