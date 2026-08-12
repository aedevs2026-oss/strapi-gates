'use strict';

/**
 * Seeds a sample school route, bus, and driver for GPS tracking development.
 * Usage: node scripts/seed-transport.js
 */
const { createStrapi } = require('@strapi/strapi');

const run = async () => {
  const strapi = await createStrapi().load();
  await strapi.start();

  const school = await strapi.documents('api::school.school').findFirst();
  if (!school) {
    throw new Error('Create a School record in Strapi admin first.');
  }

  let route = await strapi.documents('api::route.route').findFirst({
    filters: { name: 'Route A - Main Campus' },
  });

  if (!route) {
    route = await strapi.documents('api::route.route').create({
      data: {
        name: 'Route A - Main Campus',
        description: 'City center to Golden Gates School',
        startPoint: 'City Center',
        endPoint: 'Golden Gates School',
        routeStatus: 'active',
        school: school.documentId,
      },
    });
    strapi.log.info(`Created route: ${route.name}`);
  }

  let bus = await strapi.documents('api::bus.bus').findFirst({
    filters: { busNumber: 'BUS-01' },
  });

  if (!bus) {
    bus = await strapi.documents('api::bus.bus').create({
      data: {
        busNumber: 'BUS-01',
        registrationNumber: 'TN01AB1234',
        capacity: 40,
        busStatus: 'active',
        school: school.documentId,
        route: route.documentId,
      },
    });
    strapi.log.info(`Created bus: ${bus.busNumber}`);
  }

  let driver = await strapi.documents('api::driver.driver').findFirst({
    filters: { mobile: '9876543210' },
  });

  if (!driver) {
    driver = await strapi.documents('api::driver.driver').create({
      data: {
        name: 'Test Driver',
        mobile: '9876543210',
        licenseNumber: 'DL-TEST-001',
        driverStatus: 'active',
      },
    });
    await strapi.documents('api::bus.bus').update({
      documentId: bus.documentId,
      data: { driver: driver.documentId },
    });
    strapi.log.info(`Created driver: ${driver.name} (${driver.mobile})`);
  }

  const student = await strapi.documents('api::student.student').findFirst({
    filters: { status: 'active' },
    populate: ['bus'],
    sort: 'createdAt:asc',
  });

  if (student && !student.bus) {
    await strapi.documents('api::student.student').update({
      documentId: student.documentId,
      data: { bus: bus.documentId },
    });
    strapi.log.info(`Assigned bus ${bus.busNumber} to student ${student.studentName}`);
  }

  strapi.log.info('Transport seed complete. Driver OTP login: 9876543210');
  await strapi.destroy();
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
