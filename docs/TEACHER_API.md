# Teacher Mobile API

Base URL: `/api`

Authentication: `Authorization: Bearer <teacher_jwt>`

---

## Auth

### POST `/teacher-auth/send-otp`

**Body**
```json
{ "mobileNumber": "9876543210" }
```

**Response**
```json
{
  "data": {
    "message": "OTP sent successfully",
    "mobileNumber": "9876543210",
    "expiresInMinutes": 5
  }
}
```

### POST `/teacher-auth/verify-otp`

**Body**
```json
{ "mobileNumber": "9876543210", "otp": "123456" }
```

**Response**
```json
{
  "data": {
    "jwt": "<token>",
    "teacher": { "documentId": "...", "name": "...", "employeeId": "...", "mobile": "...", "email": "...", "role": "class_incharge", "status": "active" },
    "role": { "name": "Class Incharge", "code": "class_incharge", "roles": [] },
    "permissions": [{ "name": "Dashboard", "key": "dashboard", "enabled": true }],
    "assignedClasses": [{ "documentId": "...", "className": "Grade 5", "section": "A" }],
    "assignedSubjects": [{ "documentId": "...", "subjectName": "Mathematics", "code": "MATH" }],
    "teacherAssignments": [{ "documentId": "...", "class": {}, "subject": {}, "academicYear": {} }],
    "inchargeClasses": []
  }
}
```

### GET `/teacher-auth/me`

Returns the same payload as verify-otp (without jwt).

---

## Teacher Mobile

All routes require teacher JWT policy.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/teacher/dashboard` | Dashboard summary, today's timetable, recent homework |
| GET | `/teacher/classes` | Assigned classes with incharge flag and subject assignments |
| GET | `/teacher/students?classId=` | Students (Class Incharge only) |
| GET | `/teacher/timetable?classId=&day=` | Timetable filtered by assignments |
| GET | `/teacher/attendance?classId=&date=` | Attendance for class |
| POST | `/teacher/attendance` | Submit attendance entries |
| GET | `/teacher/homework?classId=&subjectId=` | Homework list |
| POST | `/teacher/homework` | Create homework |
| GET | `/teacher/marks?classId=&subjectId=&examId=` | Marks for class/subject/exam |
| POST | `/teacher/marks` | Submit marks |
| GET | `/teacher/exams?classId=` | Exams for class |
| GET | `/teacher/notifications` | Teacher notifications |
| GET | `/teacher/profile` | Teacher profile |

---

## Content Types

| Content Type | Key Fields |
|--------------|------------|
| Teacher | name, employeeId, mobile, email, teacherRole, teacherStatus |
| Class | className, section, classIncharges (M2M) |
| Subject | subjectName, code |
| Academic Year | name, startDate, endDate, status |
| Teacher Assignment | teacher, class, subject, academicYear |
| Permission | name, key, enabled |

---

## Roles & Permissions

**Class Incharge:** dashboard, my_classes, student_list, attendance, homework, marks_entry, notifications, profile, settings

**Subject Teacher:** dashboard, my_classes, timetable, attendance, homework, marks_entry, notifications, profile, settings

Permissions are stored in the `Permission` content type and resolved at login based on teacher assignments and incharge classes.

---

## Assignment Filtering

All teacher mobile APIs filter data using `TeacherAssignment` (class + subject + academic year) and `Class.classIncharges`. Teachers only access their assigned class/subject combinations; class incharge teachers get broader class-level access for student list and attendance.
