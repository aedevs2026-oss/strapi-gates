# Database Schema & Relationships

## Entity Relationship Diagram

```mermaid
erDiagram
    SCHOOL ||--o{ CONTACT_DETAIL : has
    ACADEMIC_YEAR ||--o{ CLASS : contains
    ACADEMIC_YEAR ||--o{ EXAM : contains
    ACADEMIC_YEAR ||--o{ FEE : contains

    CLASS ||--o{ SECTION : has
    CLASS ||--o{ STUDENT : enrolls
    CLASS }o--|| TEACHER : "class teacher"
    CLASS }o--o{ SUBJECT : teaches
    CLASS ||--o{ HOMEWORK : assigns
    CLASS ||--o{ TIMETABLE : schedules
    CLASS ||--o{ EXAM : conducts

    SECTION ||--o{ STUDENT : groups

    PARENT ||--o{ STUDENT : guardians
    PARENT ||--o{ OTP_RECORD : verifies

    STUDENT ||--o{ ATTENDANCE : records
    STUDENT ||--o{ ASSIGNMENT : submits
    STUDENT ||--o{ EXAM_RESULT : receives
    STUDENT ||--o{ FEE : owes
    STUDENT ||--o{ FEE_PAYMENT : pays

    TEACHER }o--o{ SUBJECT : teaches
    TEACHER ||--o{ HOMEWORK : creates
    TEACHER ||--o{ ASSIGNMENT : grades
    TEACHER ||--o{ TIMETABLE : conducts

    SUBJECT ||--o{ HOMEWORK : for
    SUBJECT ||--o{ TIMETABLE : scheduled
    SUBJECT ||--o{ EXAM_SCHEDULE : scheduled
    SUBJECT ||--o{ EXAM_RESULT : graded

    EXAM ||--o{ EXAM_SCHEDULE : schedules
    EXAM ||--o{ EXAM_RESULT : produces

    FEE ||--o{ FEE_PAYMENT : paid_via

    NOTIFICATION }o--o| PARENT : targets
    NOTIFICATION }o--o| CLASS : targets

    CIRCULAR }o--o| CLASS : targets
```

## Collections Overview

| Collection | Table Name | Key Relations |
|------------|------------|---------------|
| School | `schools` | Single type — logo media |
| Academic Year | `academic_years` | → classes, exams, fees |
| Class | `classes` | → academicYear, classTeacher, sections, students |
| Section | `sections` | → class, students |
| Subject | `subjects` | ↔ teachers, classes |
| Teacher | `teachers` | ↔ subjects, → homeworks, assignments |
| Parent | `parents` | → students (mobile login identity) |
| Student | `students` | → parent, class, section |
| Attendance | `attendances` | → student |
| Homework | `homeworks` | → subject, teacher, class |
| Assignment | `assignments` | → teacher, student |
| Exam | `exams` | → class, academicYear |
| Exam Schedule | `exam_schedules` | → exam, subject |
| Exam Result | `exam_results` | → student, exam, subject |
| Timetable | `timetables` | → class, subject, teacher |
| Circular | `circulars` | → targetClass (optional) |
| Holiday | `holidays` | Standalone |
| Fee | `fees` | → student, academicYear |
| Fee Payment | `fee_payments` | → student, fee |
| Notification | `notifications` | → targetParent, targetClass |
| Gallery | `galleries` | Media (images) |
| Contact Detail | `contact_details` | Standalone |
| OTP Record | `otp_records` | Temporary auth records |

## Key Indexes (Recommended for Production)

```sql
CREATE INDEX idx_parents_mobile ON parents(mobile_number);
CREATE INDEX idx_students_parent ON students_parent_lnk(parent_id);
CREATE INDEX idx_students_class ON students_class_lnk(class_id);
CREATE INDEX idx_attendance_student_date ON attendances(student_id, date);
CREATE INDEX idx_fees_student_status ON fees(student_id, status);
CREATE INDEX idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX idx_otp_mobile ON otp_records(mobile_number);
```

> Strapi auto-creates link tables for relations. Run `npm run develop` once to generate schema, then add indexes via migration.

## Data Integrity Rules

1. **Parent ↔ Student**: A student must belong to exactly one parent for mobile app access
2. **Fee amounts**: `pendingAmount = totalAmount - discount - paidAmount`
3. **OTP records**: Auto-expire after `OTP_EXPIRY_MINUTES`; cleaned every 15 minutes
4. **Exam results**: Published only after admin approval (`draftAndPublish`)
5. **Circulars/Homework**: Use draft/publish workflow

## Media Upload Types

| Use Case | Allowed Types | Field |
|----------|---------------|-------|
| Student photo | images | `student.photo` |
| Homework attachment | files (PDF) | `homework.attachmentPdf` |
| Assignment attachment | files, images | `assignment.attachment` |
| Circular PDF/image | files, images | `circular.pdf`, `circular.image` |
| Fee receipt | files, images | `fee-payment.receipt` |
| Gallery | images | `gallery.images` |
| School logo | images | `school.logo` |
