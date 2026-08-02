'use strict';

const ROLE_DEFINITIONS = {
  class_incharge: {
    name: 'Class Incharge',
    code: 'class_incharge',
    permissionKeys: [
      'dashboard',
      'my_classes',
      'student_list',
      'attendance',
      'homework',
      'marks_entry',
      'notifications',
      'profile',
      'settings',
    ],
  },
  subject_teacher: {
    name: 'Subject Teacher',
    code: 'subject_teacher',
    permissionKeys: [
      'dashboard',
      'my_classes',
      'timetable',
      'attendance',
      'homework',
      'marks_entry',
      'notifications',
      'profile',
      'settings',
    ],
  },
};

const PERMISSION_SEED = [
  { name: 'Dashboard', key: 'dashboard' },
  { name: 'My Classes', key: 'my_classes' },
  { name: 'Student List', key: 'student_list' },
  { name: "Today's Timetable", key: 'timetable' },
  { name: 'Attendance', key: 'attendance' },
  { name: 'Homework', key: 'homework' },
  { name: 'Marks Entry', key: 'marks_entry' },
  { name: 'Notifications', key: 'notifications' },
  { name: 'Profile', key: 'profile' },
  { name: 'Settings', key: 'settings' },
];

const resolveTeacherRoles = ({ inchargeClassIds = [], assignmentCount = 0 }) => {
  const roles = [];

  if (inchargeClassIds.length) {
    roles.push(ROLE_DEFINITIONS.class_incharge);
  }

  if (assignmentCount > 0) {
    roles.push(ROLE_DEFINITIONS.subject_teacher);
  }

  if (!roles.length) {
    roles.push(ROLE_DEFINITIONS.subject_teacher);
  }

  return roles;
};

const resolvePrimaryRole = (roles) => {
  if (roles.some((r) => r.code === 'class_incharge')) {
    return ROLE_DEFINITIONS.class_incharge;
  }
  return ROLE_DEFINITIONS.subject_teacher;
};

const buildPermissionKeysForRoles = (roles) => {
  const keys = new Set();
  for (const role of roles) {
    for (const key of role.permissionKeys) {
      keys.add(key);
    }
  }
  return [...keys];
};

const filterEnabledPermissions = (permissionKeys, enabledPermissions) => {
  const dbList = enabledPermissions || [];
  const enabledKeys = new Set(
    dbList.filter((p) => p.enabled !== false).map((p) => p.key)
  );

  // If permissions are not seeded yet in Strapi, fall back to role keys.
  const keysToUse =
    enabledKeys.size > 0
      ? permissionKeys.filter((key) => enabledKeys.has(key))
      : permissionKeys;

  return keysToUse.map((key) => {
    const seed = PERMISSION_SEED.find((p) => p.key === key);
    const db = dbList.find((p) => p.key === key);
    return {
      name: db?.name || seed?.name || key,
      key,
      enabled: db?.enabled !== false,
    };
  });
};

module.exports = {
  ROLE_DEFINITIONS,
  PERMISSION_SEED,
  resolveTeacherRoles,
  resolvePrimaryRole,
  buildPermissionKeysForRoles,
  filterEnabledPermissions,
};
