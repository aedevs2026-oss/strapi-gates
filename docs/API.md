# API Documentation — Parent Mobile App

Base URL: `http://localhost:1337/api`

All responses are JSON. Authenticated endpoints require header:

```
Authorization: Bearer <jwt_token>
```

---

## Authentication

### Send OTP

`POST /auth/send-otp`

**Public** · Rate limited

**Request:**
```json
{
  "mobileNumber": "9876543210"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "OTP sent successfully",
    "mobileNumber": "9876543210",
    "expiresInMinutes": 5,
    "otp": "123456"
  },
  "meta": {}
}
```

> `otp` is only returned when `OTP_DEV_MODE=true`.

**Errors:** `400` invalid/unregistered mobile · `429` rate limited

---

### Verify OTP

`POST /auth/verify-otp`

**Public**

**Request:**
```json
{
  "mobileNumber": "9876543210",
  "otp": "123456",
  "deviceToken": "fcm_device_token_optional"
}
```

**Response (200):**
```json
{
  "data": {
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "parent": {
      "documentId": "abc123",
      "fatherName": "Rajesh Kumar",
      "motherName": "Priya Kumar",
      "guardianName": null,
      "mobileNumber": "9876543210",
      "email": "rajesh@email.com",
      "students": [
        {
          "documentId": "stu001",
          "studentName": "Aarav Kumar",
          "admissionNumber": "ADM2024001",
          "rollNumber": "12",
          "class": { "className": "Class 5" },
          "section": { "name": "A" }
        }
      ]
    }
  },
  "meta": {}
}
```

---

### Get Profile

`GET /auth/me`

**Authenticated**

**Response (200):** Same parent object with populated students.

---

### Update Device Token

`PUT /auth/device-token`

**Authenticated**

**Request:**
```json
{
  "deviceToken": "new_fcm_token"
}
```

---

## Parent Portal

All endpoints below require JWT authentication.

### Students

| Method | Path | Description |
|--------|------|-------------|
| GET | `/parent/students` | List linked students |
| GET | `/parent/students/:studentId` | Student profile |

**Sample — GET /parent/students:**
```json
{
  "data": [
    {
      "documentId": "stu001",
      "admissionNumber": "ADM2024001",
      "studentName": "Aarav Kumar",
      "rollNumber": "12",
      "dob": "2015-03-15",
      "gender": "male",
      "bloodGroup": "B+",
      "status": "active",
      "photo": { "url": "/uploads/photo.jpg" },
      "class": { "className": "Class 5" },
      "section": { "name": "A" }
    }
  ],
  "meta": { "total": 1 }
}
```

---

### Homework

`GET /parent/homework?studentId=stu001&page=1&pageSize=25&sort=dueDate:desc`

**Query params:** `studentId`, `page`, `pageSize`, `sort`

```json
{
  "data": [
    {
      "documentId": "hw001",
      "title": "Math Chapter 5 Exercises",
      "description": "Complete exercises 1-10",
      "dueDate": "2026-04-01T23:59:00.000Z",
      "status": "published",
      "subject": { "name": "Mathematics" },
      "teacher": { "name": "Mr. Sharma" },
      "attachmentPdf": { "url": "/uploads/hw.pdf" }
    }
  ],
  "meta": {
    "pagination": { "start": 0, "limit": 25, "total": 5, "page": 1 }
  }
}
```

---

### Assignments

`GET /parent/assignments?studentId=stu001&page=1&pageSize=25`

---

### Attendance

`GET /parent/attendance?studentId=stu001&from=2026-03-01&to=2026-03-31&status=present`

**Response includes stats:**
```json
{
  "data": [ { "date": "2026-03-01", "status": "present", "remarks": null } ],
  "meta": {
    "pagination": { "start": 0, "limit": 25, "total": 20 },
    "stats": { "present": 18, "absent": 1, "late": 1, "total": 20 }
  }
}
```

---

### Exam Schedule

`GET /parent/exam-schedules?studentId=stu001`

---

### Exam Results

`GET /parent/exam-results?studentId=stu001&examId=exam001`

```json
{
  "data": [
    {
      "marks": 85,
      "maxMarks": 100,
      "grade": "A",
      "subject": { "name": "Mathematics" },
      "exam": { "examName": "Mid Term 2026" }
    }
  ],
  "meta": {}
}
```

---

### Timetable

`GET /parent/timetable?studentId=stu001&day=monday`

---

### Circulars

`GET /parent/circulars?page=1&pageSize=25&sort=publishDate:desc`

---

### Holidays

`GET /parent/holidays?from=2026-01-01&to=2026-12-31`

---

### Fees

| Method | Path | Description |
|--------|------|-------------|
| GET | `/parent/fees?studentId=stu001&status=pending` | All fees |
| GET | `/parent/fees/pending` | Pending fees only |
| GET | `/parent/fees/history?studentId=stu001` | Payment history |

**Pending fees response:**
```json
{
  "data": [
    {
      "documentId": "fee001",
      "totalAmount": 50000,
      "discount": 5000,
      "paidAmount": 20000,
      "pendingAmount": 25000,
      "dueDate": "2026-04-15",
      "status": "partial",
      "student": { "studentName": "Aarav Kumar" }
    }
  ],
  "meta": { "totalPending": 25000 }
}
```

---

### Notifications

`GET /parent/notifications?page=1&pageSize=25`

---

### School & Contact

| Method | Path |
|--------|------|
| GET | `/parent/school` |
| GET | `/parent/contacts` |
| GET | `/parent/gallery` |

---

## Payments (Razorpay)

### Create Order

`POST /payment/create-order`

**Authenticated**

**Request:**
```json
{
  "feeId": "fee001",
  "amount": 25000
}
```

**Response:**
```json
{
  "data": {
    "orderId": "order_Mxxxx",
    "amount": 25000,
    "currency": "INR",
    "keyId": "rzp_test_xxxxx",
    "paymentDocumentId": "pay001",
    "fee": { "documentId": "fee001", "pendingAmount": 25000 }
  },
  "meta": {}
}
```

Use `orderId` and `keyId` in React Native Razorpay SDK.

---

### Verify Payment

`POST /payment/verify`

**Request:**
```json
{
  "razorpayOrderId": "order_Mxxxx",
  "razorpayPaymentId": "pay_Mxxxx",
  "razorpaySignature": "signature_hash",
  "paymentDocumentId": "pay001"
}
```

**Response:**
```json
{
  "data": {
    "message": "Payment verified successfully",
    "receiptNumber": "RCP-20260401-A1B2C3",
    "payment": {
      "amount": 25000,
      "status": "success",
      "transactionId": "pay_Mxxxx"
    }
  },
  "meta": {}
}
```

---

## Push Notifications (Admin)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/push/parent` | Send to one parent |
| POST | `/push/all-parents` | Broadcast to all |
| POST | `/push/class` | Send to class parents |

**Request (send to parent):**
```json
{
  "parentId": "abc123",
  "title": "Fee Reminder",
  "message": "Your fee is due on April 15",
  "data": { "screen": "fees" }
}
```

---

## Pagination & Filtering

| Param | Default | Max |
|-------|---------|-----|
| `page` | 1 | — |
| `pageSize` | 25 | 100 |
| `sort` | varies | `field:asc` or `field:desc` |

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthorized (invalid/missing JWT) |
| 403 | Forbidden (student not linked to parent) |
| 404 | Not found |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

## Error Response Format

```json
{
  "error": {
    "status": 400,
    "name": "BadRequestError",
    "message": "Invalid mobile number",
    "details": null
  }
}
```
