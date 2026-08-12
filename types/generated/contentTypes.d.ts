import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    adminPermissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::permission'
    >;
    adminUserOwner: Schema.Attribute.Relation<'manyToOne', 'admin::user'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    expiresAt: Schema.Attribute.DateTime;
    kind: Schema.Attribute.Enumeration<['content-api', 'admin']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'content-api'>;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    apiToken: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> &
      Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminSession extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_sessions';
  info: {
    description: 'Session Manager storage';
    displayName: 'Session';
    name: 'Session';
    pluralName: 'sessions';
    singularName: 'session';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
    i18n: {
      localized: false;
    };
  };
  attributes: {
    absoluteExpiresAt: Schema.Attribute.DateTime & Schema.Attribute.Private;
    childId: Schema.Attribute.String & Schema.Attribute.Private;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deviceId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    expiresAt: Schema.Attribute.DateTime &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::session'> &
      Schema.Attribute.Private;
    origin: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    sessionId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique;
    status: Schema.Attribute.String & Schema.Attribute.Private;
    type: Schema.Attribute.String & Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    userId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    apiTokens: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiAcademicYearAcademicYear
  extends Struct.CollectionTypeSchema {
  collectionName: 'academic_years';
  info: {
    description: 'Academic year periods';
    displayName: 'Academic Year';
    pluralName: 'academic-years';
    singularName: 'academic-year';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    classes: Schema.Attribute.Relation<'oneToMany', 'api::class.class'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    endDate: Schema.Attribute.Date & Schema.Attribute.Required;
    exams: Schema.Attribute.Relation<'oneToMany', 'api::exam.exam'>;
    fees: Schema.Attribute.Relation<'oneToMany', 'api::fee.fee'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::academic-year.academic-year'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    startDate: Schema.Attribute.Date & Schema.Attribute.Required;
    status: Schema.Attribute.Enumeration<['upcoming', 'active', 'completed']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'upcoming'>;
    teacherAssignments: Schema.Attribute.Relation<
      'oneToMany',
      'api::teacher-assignment.teacher-assignment'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiAssignmentAssignment extends Struct.CollectionTypeSchema {
  collectionName: 'assignments';
  info: {
    description: 'Student assignment submissions and grading';
    displayName: 'Assignment';
    pluralName: 'assignments';
    singularName: 'assignment';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    attachment: Schema.Attribute.Media<'files' | 'images'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.RichText;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::assignment.assignment'
    > &
      Schema.Attribute.Private;
    marks: Schema.Attribute.Decimal;
    maxMarks: Schema.Attribute.Decimal;
    publishedAt: Schema.Attribute.DateTime;
    remarks: Schema.Attribute.String;
    status: Schema.Attribute.Enumeration<
      ['pending', 'submitted', 'graded', 'late']
    > &
      Schema.Attribute.DefaultTo<'pending'>;
    student: Schema.Attribute.Relation<'manyToOne', 'api::student.student'> &
      Schema.Attribute.Required;
    submissionDate: Schema.Attribute.DateTime;
    teacher: Schema.Attribute.Relation<'manyToOne', 'api::teacher.teacher'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiAttendanceAttendance extends Struct.CollectionTypeSchema {
  collectionName: 'attendances';
  info: {
    description: 'Daily student attendance records';
    displayName: 'Attendance';
    pluralName: 'attendances';
    singularName: 'attendance';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::attendance.attendance'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    remarks: Schema.Attribute.String;
    status: Schema.Attribute.Enumeration<
      ['present', 'absent', 'late', 'half_day', 'leave']
    > &
      Schema.Attribute.Required;
    student: Schema.Attribute.Relation<'manyToOne', 'api::student.student'> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiBusBus extends Struct.CollectionTypeSchema {
  collectionName: 'buses';
  info: {
    description: 'School transport buses';
    displayName: 'Bus';
    pluralName: 'buses';
    singularName: 'bus';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    busNumber: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    busStatus: Schema.Attribute.Enumeration<
      ['active', 'inactive', 'maintenance']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'active'>;
    capacity: Schema.Attribute.Integer;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    driver: Schema.Attribute.Relation<'oneToOne', 'api::driver.driver'>;
    liveLocations: Schema.Attribute.Relation<
      'oneToMany',
      'api::live-location.live-location'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::bus.bus'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    registrationNumber: Schema.Attribute.String;
    route: Schema.Attribute.Relation<'manyToOne', 'api::route.route'>;
    school: Schema.Attribute.Relation<'manyToOne', 'api::school.school'>;
    students: Schema.Attribute.Relation<'oneToMany', 'api::student.student'>;
    trips: Schema.Attribute.Relation<'oneToMany', 'api::trip.trip'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCircularCircular extends Struct.CollectionTypeSchema {
  collectionName: 'circulars';
  info: {
    description: 'School circulars and announcements';
    displayName: 'Circular';
    pluralName: 'circulars';
    singularName: 'circular';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.RichText;
    image: Schema.Attribute.Media<'images'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::circular.circular'
    > &
      Schema.Attribute.Private;
    pdf: Schema.Attribute.Media<'files'>;
    priority: Schema.Attribute.Enumeration<
      ['low', 'normal', 'high', 'urgent']
    > &
      Schema.Attribute.DefaultTo<'normal'>;
    publishDate: Schema.Attribute.DateTime & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    target: Schema.Attribute.Enumeration<
      ['all', 'parents', 'teachers', 'staff', 'specific_class']
    > &
      Schema.Attribute.DefaultTo<'parents'>;
    targetClass: Schema.Attribute.Relation<'manyToOne', 'api::class.class'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiClassClass extends Struct.CollectionTypeSchema {
  collectionName: 'classes';
  info: {
    description: 'School classes / grades';
    displayName: 'Class';
    pluralName: 'classes';
    singularName: 'class';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    academicYear: Schema.Attribute.Relation<
      'manyToOne',
      'api::academic-year.academic-year'
    >;
    classIncharges: Schema.Attribute.Relation<
      'manyToMany',
      'api::teacher.teacher'
    >;
    className: Schema.Attribute.String & Schema.Attribute.Required;
    classTeacher: Schema.Attribute.Relation<
      'manyToOne',
      'api::teacher.teacher'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    exams: Schema.Attribute.Relation<'oneToMany', 'api::exam.exam'>;
    homeworks: Schema.Attribute.Relation<'oneToMany', 'api::homework.homework'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::class.class'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    section: Schema.Attribute.String;
    sections: Schema.Attribute.Relation<'oneToMany', 'api::section.section'>;
    students: Schema.Attribute.Relation<'oneToMany', 'api::student.student'>;
    subjects: Schema.Attribute.Relation<'manyToMany', 'api::subject.subject'>;
    teacherAssignments: Schema.Attribute.Relation<
      'oneToMany',
      'api::teacher-assignment.teacher-assignment'
    >;
    timetables: Schema.Attribute.Relation<
      'oneToMany',
      'api::timetable.timetable'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiContactDetailContactDetail
  extends Struct.CollectionTypeSchema {
  collectionName: 'contact_details';
  info: {
    description: 'School contact information for parents';
    displayName: 'Contact Details';
    pluralName: 'contact-details';
    singularName: 'contact-detail';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    address: Schema.Attribute.Text;
    contactPerson: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    department: Schema.Attribute.String & Schema.Attribute.Required;
    email: Schema.Attribute.Email;
    isPrimary: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::contact-detail.contact-detail'
    > &
      Schema.Attribute.Private;
    phone: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workingHours: Schema.Attribute.String;
  };
}

export interface ApiDriverDriver extends Struct.CollectionTypeSchema {
  collectionName: 'drivers';
  info: {
    description: 'School bus drivers';
    displayName: 'Driver';
    pluralName: 'drivers';
    singularName: 'driver';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    bus: Schema.Attribute.Relation<'oneToOne', 'api::bus.bus'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deviceToken: Schema.Attribute.String;
    driverStatus: Schema.Attribute.Enumeration<['active', 'inactive']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'active'>;
    lastLoginAt: Schema.Attribute.DateTime;
    licenseNumber: Schema.Attribute.String;
    liveLocations: Schema.Attribute.Relation<
      'oneToMany',
      'api::live-location.live-location'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::driver.driver'
    > &
      Schema.Attribute.Private;
    mobile: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    trips: Schema.Attribute.Relation<'oneToMany', 'api::trip.trip'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiExamResultExamResult extends Struct.CollectionTypeSchema {
  collectionName: 'exam_results';
  info: {
    description: 'Student exam results by subject';
    displayName: 'Exam Result';
    pluralName: 'exam-results';
    singularName: 'exam-result';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    exam: Schema.Attribute.Relation<'manyToOne', 'api::exam.exam'> &
      Schema.Attribute.Required;
    grade: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::exam-result.exam-result'
    > &
      Schema.Attribute.Private;
    marks: Schema.Attribute.Decimal & Schema.Attribute.Required;
    maxMarks: Schema.Attribute.Decimal;
    publishedAt: Schema.Attribute.DateTime;
    remarks: Schema.Attribute.String;
    student: Schema.Attribute.Relation<'manyToOne', 'api::student.student'> &
      Schema.Attribute.Required;
    subject: Schema.Attribute.Relation<'manyToOne', 'api::subject.subject'> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiExamScheduleExamSchedule
  extends Struct.CollectionTypeSchema {
  collectionName: 'exam_schedules';
  info: {
    description: 'Subject-wise exam schedule';
    displayName: 'Exam Schedule';
    pluralName: 'exam-schedules';
    singularName: 'exam-schedule';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    duration: Schema.Attribute.Integer & Schema.Attribute.Required;
    durationUnit: Schema.Attribute.Enumeration<['minutes', 'hours']> &
      Schema.Attribute.DefaultTo<'minutes'>;
    exam: Schema.Attribute.Relation<'manyToOne', 'api::exam.exam'> &
      Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::exam-schedule.exam-schedule'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    room: Schema.Attribute.String;
    subject: Schema.Attribute.Relation<'manyToOne', 'api::subject.subject'> &
      Schema.Attribute.Required;
    time: Schema.Attribute.Time & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiExamExam extends Struct.CollectionTypeSchema {
  collectionName: 'exams';
  info: {
    description: 'Exam definitions';
    displayName: 'Exam';
    pluralName: 'exams';
    singularName: 'exam';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    academicYear: Schema.Attribute.Relation<
      'manyToOne',
      'api::academic-year.academic-year'
    >;
    class: Schema.Attribute.Relation<'manyToOne', 'api::class.class'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    examName: Schema.Attribute.String & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::exam.exam'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    results: Schema.Attribute.Relation<
      'oneToMany',
      'api::exam-result.exam-result'
    >;
    schedules: Schema.Attribute.Relation<
      'oneToMany',
      'api::exam-schedule.exam-schedule'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiFeePaymentFeePayment extends Struct.CollectionTypeSchema {
  collectionName: 'fee_payments';
  info: {
    description: 'Fee payment transactions';
    displayName: 'Fee Payment';
    pluralName: 'fee-payments';
    singularName: 'fee-payment';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    amount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    fee: Schema.Attribute.Relation<'manyToOne', 'api::fee.fee'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::fee-payment.fee-payment'
    > &
      Schema.Attribute.Private;
    paymentDate: Schema.Attribute.DateTime & Schema.Attribute.Required;
    paymentMethod: Schema.Attribute.Enumeration<
      ['razorpay', 'cash', 'cheque', 'bank_transfer', 'upi']
    > &
      Schema.Attribute.DefaultTo<'razorpay'>;
    publishedAt: Schema.Attribute.DateTime;
    razorpayOrderId: Schema.Attribute.String;
    razorpayPaymentId: Schema.Attribute.String;
    receipt: Schema.Attribute.Media<'files' | 'images'>;
    receiptNumber: Schema.Attribute.String & Schema.Attribute.Unique;
    status: Schema.Attribute.Enumeration<
      ['pending', 'success', 'failed', 'refunded']
    > &
      Schema.Attribute.DefaultTo<'pending'>;
    student: Schema.Attribute.Relation<'manyToOne', 'api::student.student'> &
      Schema.Attribute.Required;
    transactionId: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiFeeFee extends Struct.CollectionTypeSchema {
  collectionName: 'fees';
  info: {
    description: 'Student fee records';
    displayName: 'Fee';
    pluralName: 'fees';
    singularName: 'fee';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    academicYear: Schema.Attribute.Relation<
      'manyToOne',
      'api::academic-year.academic-year'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    discount: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    dueDate: Schema.Attribute.Date & Schema.Attribute.Required;
    feeType: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::fee.fee'> &
      Schema.Attribute.Private;
    paidAmount: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    payments: Schema.Attribute.Relation<
      'oneToMany',
      'api::fee-payment.fee-payment'
    >;
    pendingAmount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['pending', 'partial', 'paid', 'overdue']
    > &
      Schema.Attribute.DefaultTo<'pending'>;
    student: Schema.Attribute.Relation<'manyToOne', 'api::student.student'> &
      Schema.Attribute.Required;
    totalAmount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiGalleryGallery extends Struct.CollectionTypeSchema {
  collectionName: 'galleries';
  info: {
    description: 'School event photo galleries';
    displayName: 'Gallery';
    pluralName: 'galleries';
    singularName: 'gallery';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    coverImage: Schema.Attribute.Media<'images'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    eventDate: Schema.Attribute.Date;
    images: Schema.Attribute.Media<'images', true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::gallery.gallery'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiHolidayHoliday extends Struct.CollectionTypeSchema {
  collectionName: 'holidays';
  info: {
    description: 'School holidays calendar';
    displayName: 'Holiday';
    pluralName: 'holidays';
    singularName: 'holiday';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    description: Schema.Attribute.Text;
    endDate: Schema.Attribute.Date;
    holidayName: Schema.Attribute.String & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::holiday.holiday'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['public', 'school', 'exam_break']> &
      Schema.Attribute.DefaultTo<'school'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiHomeworkHomework extends Struct.CollectionTypeSchema {
  collectionName: 'homeworks';
  info: {
    description: 'Homework assigned to classes';
    displayName: 'Homework';
    pluralName: 'homeworks';
    singularName: 'homework';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    attachmentPdf: Schema.Attribute.Media<'files'>;
    class: Schema.Attribute.Relation<'manyToOne', 'api::class.class'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.RichText;
    dueDate: Schema.Attribute.DateTime & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::homework.homework'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<['draft', 'published', 'closed']> &
      Schema.Attribute.DefaultTo<'published'>;
    subject: Schema.Attribute.Relation<'manyToOne', 'api::subject.subject'>;
    teacher: Schema.Attribute.Relation<'manyToOne', 'api::teacher.teacher'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiLiveLocationLiveLocation
  extends Struct.CollectionTypeSchema {
  collectionName: 'live_locations';
  info: {
    description: 'Real-time GPS coordinates from driver devices';
    displayName: 'Live Location';
    pluralName: 'live-locations';
    singularName: 'live-location';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    accuracy: Schema.Attribute.Decimal;
    bus: Schema.Attribute.Relation<'manyToOne', 'api::bus.bus'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    driver: Schema.Attribute.Relation<'manyToOne', 'api::driver.driver'>;
    heading: Schema.Attribute.Decimal;
    latitude: Schema.Attribute.Decimal & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::live-location.live-location'
    > &
      Schema.Attribute.Private;
    longitude: Schema.Attribute.Decimal & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    speed: Schema.Attribute.Decimal;
    timestamp: Schema.Attribute.DateTime & Schema.Attribute.Required;
    trip: Schema.Attribute.Relation<'manyToOne', 'api::trip.trip'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiNotificationNotification
  extends Struct.CollectionTypeSchema {
  collectionName: 'notifications';
  info: {
    description: 'Push notifications sent to parents';
    displayName: 'Notification';
    pluralName: 'notifications';
    singularName: 'notification';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataPayload: Schema.Attribute.JSON;
    image: Schema.Attribute.Media<'images'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::notification.notification'
    > &
      Schema.Attribute.Private;
    message: Schema.Attribute.Text & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    sent: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    sentDate: Schema.Attribute.DateTime;
    target: Schema.Attribute.Enumeration<
      ['all_parents', 'all_teachers', 'specific_parent', 'specific_class']
    > &
      Schema.Attribute.DefaultTo<'all_parents'>;
    targetClass: Schema.Attribute.Relation<'manyToOne', 'api::class.class'>;
    targetParent: Schema.Attribute.Relation<'manyToOne', 'api::parent.parent'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiOtpRecordOtpRecord extends Struct.CollectionTypeSchema {
  collectionName: 'otp_records';
  info: {
    description: 'Temporary OTP storage for mobile login';
    displayName: 'OTP Record';
    pluralName: 'otp-records';
    singularName: 'otp-record';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    attempts: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    expiresAt: Schema.Attribute.DateTime & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::otp-record.otp-record'
    > &
      Schema.Attribute.Private;
    mobileNumber: Schema.Attribute.String & Schema.Attribute.Required;
    otp: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    verified: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface ApiParentParent extends Struct.CollectionTypeSchema {
  collectionName: 'parents';
  info: {
    description: 'Parent / guardian accounts for mobile app';
    displayName: 'Parent';
    pluralName: 'parents';
    singularName: 'parent';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    address: Schema.Attribute.Text;
    alternativeMobile: Schema.Attribute.String;
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deviceToken: Schema.Attribute.String;
    email: Schema.Attribute.Email;
    fatherName: Schema.Attribute.String;
    guardianName: Schema.Attribute.String;
    lastLoginAt: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::parent.parent'
    > &
      Schema.Attribute.Private;
    mobileNumber: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    motherName: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    students: Schema.Attribute.Relation<'oneToMany', 'api::student.student'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPermissionPermission extends Struct.CollectionTypeSchema {
  collectionName: 'permissions';
  info: {
    description: 'Teacher app screen permissions';
    displayName: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    enabled: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    key: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::permission.permission'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiRouteRoute extends Struct.CollectionTypeSchema {
  collectionName: 'routes';
  info: {
    description: 'Bus transport routes';
    displayName: 'Route';
    pluralName: 'routes';
    singularName: 'route';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    buses: Schema.Attribute.Relation<'oneToMany', 'api::bus.bus'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    endPoint: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::route.route'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    routeStatus: Schema.Attribute.Enumeration<['active', 'inactive']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'active'>;
    school: Schema.Attribute.Relation<'manyToOne', 'api::school.school'>;
    startPoint: Schema.Attribute.String;
    trips: Schema.Attribute.Relation<'oneToMany', 'api::trip.trip'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiSchoolSchool extends Struct.SingleTypeSchema {
  collectionName: 'schools';
  info: {
    description: 'School profile and branding information';
    displayName: 'School';
    pluralName: 'schools';
    singularName: 'school';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    address: Schema.Attribute.Text;
    brandPrimaryColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#5E2A84'>;
    brandSecondaryColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#F4B400'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::school.school'
    > &
      Schema.Attribute.Private;
    logo: Schema.Attribute.Media<'images'>;
    phone: Schema.Attribute.String;
    principal: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    schoolName: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    website: Schema.Attribute.String;
  };
}

export interface ApiSectionSection extends Struct.CollectionTypeSchema {
  collectionName: 'sections';
  info: {
    description: 'Class sections (e.g. A, B, C)';
    displayName: 'Section';
    pluralName: 'sections';
    singularName: 'section';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    class: Schema.Attribute.Relation<'manyToOne', 'api::class.class'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::section.section'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    students: Schema.Attribute.Relation<'oneToMany', 'api::student.student'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiStudentStudent extends Struct.CollectionTypeSchema {
  collectionName: 'students';
  info: {
    description: 'Enrolled students';
    displayName: 'Student';
    pluralName: 'students';
    singularName: 'student';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    admissionDate: Schema.Attribute.Date;
    admissionNumber: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    assignments: Schema.Attribute.Relation<
      'oneToMany',
      'api::assignment.assignment'
    >;
    attendances: Schema.Attribute.Relation<
      'oneToMany',
      'api::attendance.attendance'
    >;
    bloodGroup: Schema.Attribute.String;
    bus: Schema.Attribute.Relation<'manyToOne', 'api::bus.bus'>;
    class: Schema.Attribute.Relation<'manyToOne', 'api::class.class'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dob: Schema.Attribute.Date;
    examResults: Schema.Attribute.Relation<
      'oneToMany',
      'api::exam-result.exam-result'
    >;
    feePayments: Schema.Attribute.Relation<
      'oneToMany',
      'api::fee-payment.fee-payment'
    >;
    fees: Schema.Attribute.Relation<'oneToMany', 'api::fee.fee'>;
    gender: Schema.Attribute.Enumeration<['male', 'female', 'other']>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::student.student'
    > &
      Schema.Attribute.Private;
    parent: Schema.Attribute.Relation<'manyToOne', 'api::parent.parent'>;
    photo: Schema.Attribute.Media<'images'>;
    publishedAt: Schema.Attribute.DateTime;
    rollNumber: Schema.Attribute.String;
    section: Schema.Attribute.Relation<'manyToOne', 'api::section.section'>;
    status: Schema.Attribute.Enumeration<
      ['active', 'inactive', 'transferred', 'graduated']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'active'>;
    studentName: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiSubjectSubject extends Struct.CollectionTypeSchema {
  collectionName: 'subjects';
  info: {
    description: 'Academic subjects';
    displayName: 'Subject';
    pluralName: 'subjects';
    singularName: 'subject';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    classes: Schema.Attribute.Relation<'manyToMany', 'api::class.class'>;
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    examResults: Schema.Attribute.Relation<
      'oneToMany',
      'api::exam-result.exam-result'
    >;
    examSchedules: Schema.Attribute.Relation<
      'oneToMany',
      'api::exam-schedule.exam-schedule'
    >;
    homeworks: Schema.Attribute.Relation<'oneToMany', 'api::homework.homework'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::subject.subject'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    subjectName: Schema.Attribute.String;
    teacherAssignments: Schema.Attribute.Relation<
      'oneToMany',
      'api::teacher-assignment.teacher-assignment'
    >;
    teachers: Schema.Attribute.Relation<'manyToMany', 'api::teacher.teacher'>;
    timetables: Schema.Attribute.Relation<
      'oneToMany',
      'api::timetable.timetable'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTeacherAssignmentTeacherAssignment
  extends Struct.CollectionTypeSchema {
  collectionName: 'teacher_assignments';
  info: {
    description: 'Maps teachers to class and subject for an academic year';
    displayName: 'Teacher Assignment';
    pluralName: 'teacher-assignments';
    singularName: 'teacher-assignment';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    academicYear: Schema.Attribute.Relation<
      'manyToOne',
      'api::academic-year.academic-year'
    > &
      Schema.Attribute.Required;
    class: Schema.Attribute.Relation<'manyToOne', 'api::class.class'> &
      Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::teacher-assignment.teacher-assignment'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    subject: Schema.Attribute.Relation<'manyToOne', 'api::subject.subject'> &
      Schema.Attribute.Required;
    teacher: Schema.Attribute.Relation<'manyToOne', 'api::teacher.teacher'> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTeacherTeacher extends Struct.CollectionTypeSchema {
  collectionName: 'teachers';
  info: {
    description: 'School teaching staff';
    displayName: 'Teacher';
    pluralName: 'teachers';
    singularName: 'teacher';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    assignments: Schema.Attribute.Relation<
      'oneToMany',
      'api::assignment.assignment'
    >;
    classesAsTeacher: Schema.Attribute.Relation<
      'oneToMany',
      'api::class.class'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deviceToken: Schema.Attribute.String;
    email: Schema.Attribute.Email;
    employeeId: Schema.Attribute.String & Schema.Attribute.Unique;
    homeworks: Schema.Attribute.Relation<'oneToMany', 'api::homework.homework'>;
    inchargeClasses: Schema.Attribute.Relation<
      'manyToMany',
      'api::class.class'
    >;
    lastLoginAt: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::teacher.teacher'
    > &
      Schema.Attribute.Private;
    mobile: Schema.Attribute.String & Schema.Attribute.Unique;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    phone: Schema.Attribute.String;
    photo: Schema.Attribute.Media<'images'>;
    publishedAt: Schema.Attribute.DateTime;
    qualification: Schema.Attribute.String;
    role: Schema.Attribute.Enumeration<
      ['class_incharge', 'subject_teacher', 'both']
    > &
      Schema.Attribute.DefaultTo<'subject_teacher'>;
    subjects: Schema.Attribute.Relation<'manyToMany', 'api::subject.subject'>;
    teacherAssignments: Schema.Attribute.Relation<
      'oneToMany',
      'api::teacher-assignment.teacher-assignment'
    >;
    teacherStatus: Schema.Attribute.Enumeration<
      ['active', 'inactive', 'on_leave']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'active'>;
    timetables: Schema.Attribute.Relation<
      'oneToMany',
      'api::timetable.timetable'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTimetableTimetable extends Struct.CollectionTypeSchema {
  collectionName: 'timetables';
  info: {
    description: 'Class timetable entries';
    displayName: 'Timetable';
    pluralName: 'timetables';
    singularName: 'timetable';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    class: Schema.Attribute.Relation<'manyToOne', 'api::class.class'> &
      Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    day: Schema.Attribute.Enumeration<
      [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ]
    > &
      Schema.Attribute.Required;
    endTime: Schema.Attribute.Time & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::timetable.timetable'
    > &
      Schema.Attribute.Private;
    period: Schema.Attribute.Integer & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    startTime: Schema.Attribute.Time & Schema.Attribute.Required;
    subject: Schema.Attribute.Relation<'manyToOne', 'api::subject.subject'>;
    teacher: Schema.Attribute.Relation<'manyToOne', 'api::teacher.teacher'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTripTrip extends Struct.CollectionTypeSchema {
  collectionName: 'trips';
  info: {
    description: 'Bus trip records with start/end tracking';
    displayName: 'Trip';
    pluralName: 'trips';
    singularName: 'trip';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    bus: Schema.Attribute.Relation<'manyToOne', 'api::bus.bus'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date;
    distance: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    driver: Schema.Attribute.Relation<'manyToOne', 'api::driver.driver'>;
    duration: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    endTime: Schema.Attribute.DateTime;
    liveLocations: Schema.Attribute.Relation<
      'oneToMany',
      'api::live-location.live-location'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::trip.trip'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    route: Schema.Attribute.Relation<'manyToOne', 'api::route.route'>;
    startTime: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['Running', 'Completed', 'Cancelled']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Running'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::review-workflows.workflow-stage'
    >;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.Text;
    caption: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    focalPoint: Schema.Attribute.JSON;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    > &
      Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.Text;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.Text & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::session': AdminSession;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::academic-year.academic-year': ApiAcademicYearAcademicYear;
      'api::assignment.assignment': ApiAssignmentAssignment;
      'api::attendance.attendance': ApiAttendanceAttendance;
      'api::bus.bus': ApiBusBus;
      'api::circular.circular': ApiCircularCircular;
      'api::class.class': ApiClassClass;
      'api::contact-detail.contact-detail': ApiContactDetailContactDetail;
      'api::driver.driver': ApiDriverDriver;
      'api::exam-result.exam-result': ApiExamResultExamResult;
      'api::exam-schedule.exam-schedule': ApiExamScheduleExamSchedule;
      'api::exam.exam': ApiExamExam;
      'api::fee-payment.fee-payment': ApiFeePaymentFeePayment;
      'api::fee.fee': ApiFeeFee;
      'api::gallery.gallery': ApiGalleryGallery;
      'api::holiday.holiday': ApiHolidayHoliday;
      'api::homework.homework': ApiHomeworkHomework;
      'api::live-location.live-location': ApiLiveLocationLiveLocation;
      'api::notification.notification': ApiNotificationNotification;
      'api::otp-record.otp-record': ApiOtpRecordOtpRecord;
      'api::parent.parent': ApiParentParent;
      'api::permission.permission': ApiPermissionPermission;
      'api::route.route': ApiRouteRoute;
      'api::school.school': ApiSchoolSchool;
      'api::section.section': ApiSectionSection;
      'api::student.student': ApiStudentStudent;
      'api::subject.subject': ApiSubjectSubject;
      'api::teacher-assignment.teacher-assignment': ApiTeacherAssignmentTeacherAssignment;
      'api::teacher.teacher': ApiTeacherTeacher;
      'api::timetable.timetable': ApiTimetableTimetable;
      'api::trip.trip': ApiTripTrip;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
