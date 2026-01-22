# Attendance & Announcements API Documentation

## 📚 Overview

This documentation covers the subject-wise attendance marking and announcements features.

## 🔐 Authentication

All CR-only endpoints require JWT authentication:
```
Authorization: Bearer <token>
```

## 📊 Allowed Subjects

Only these subjects are valid for attendance:
- **ME** (Microprocessor Engineering)
- **MP** (Microprocessor)
- **DBMS** (Database Management Systems)
- **DAA** (Design and Analysis of Algorithms)
- **FLAT** (Formal Languages and Automata Theory)

⚠️ **Note**: NCC, NSS, Swachh Bharath, Remedial Class, Library/Self Study, and PEHV are NOT allowed.

## 🎯 Attendance Status Rules

| Percentage | Status |
|------------|--------|
| ≥ 75% | Eligible |
| 65-74% | Condonation |
| < 65% | Detained |

---

## 🔴 Attendance Endpoints

### 1. Mark Attendance (CR Only)

**Endpoint:** `POST /api/attendance/mark`

**Access:** CR only (JWT required)

**Description:** Mark attendance for a specific subject on a given date.

**Request Body:**
```json
{
  "subject": "DBMS",
  "date": "2026-01-22",
  "records": [
    {
      "studentId": "60d5ec49f1b2c8b1f8e4e1a1",
      "present": true
    },
    {
      "studentId": "60d5ec49f1b2c8b1f8e4e1a2",
      "present": false
    }
  ]
}
```

**Request Headers:**
```
Authorization: Bearer <CR_JWT_TOKEN>
Content-Type: application/json
```

**Validation Rules:**
- `subject` must be one of the allowed subjects
- `date` must be in YYYY-MM-DD format
- `records` must be a non-empty array
- Each record must have `studentId` (string) and `present` (boolean)

**Success Response (200):**
```json
{
  "message": "Attendance marking completed",
  "subject": "DBMS",
  "date": "2026-01-22",
  "processed": 2,
  "errors": 0,
  "results": [
    {
      "studentId": "60d5ec49f1b2c8b1f8e4e1a1",
      "regNo": "AU001",
      "name": "John Doe",
      "subject": "DBMS",
      "attended": 8,
      "total": 10,
      "percentage": 80,
      "status": "Eligible"
    },
    {
      "studentId": "60d5ec49f1b2c8b1f8e4e1a2",
      "regNo": "AU002",
      "name": "Jane Smith",
      "subject": "DBMS",
      "attended": 6,
      "total": 10,
      "percentage": 60,
      "status": "Detained"
    }
  ],
  "failedRecords": []
}
```

**Error Responses:**

**400 Bad Request** - Invalid subject:
```json
{
  "message": "Invalid subject. Allowed subjects: ME, MP, DBMS, DAA, FLAT"
}
```

**400 Bad Request** - Missing fields:
```json
{
  "message": "Subject, date, and records array are required"
}
```

**401 Unauthorized** - No token:
```json
{
  "message": "No token provided. Authorization denied."
}
```

**403 Forbidden** - Not a CR:
```json
{
  "message": "Access denied. CR role required."
}
```

---

### 2. Student Attendance Lookup

**Endpoint:** `POST /api/attendance/lookup`

**Access:** Public (no authentication required)

**Description:** Students can view their attendance by providing registration number and date of birth.

**Request Body:**
```json
{
  "regNo": "AU001",
  "dob": "2005-05-15"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "name": "John Doe",
  "regNo": "AU001",
  "attendance": [
    {
      "subject": "DBMS",
      "attended": 8,
      "total": 10,
      "percentage": 80,
      "status": "Eligible"
    },
    {
      "subject": "DAA",
      "attended": 12,
      "total": 15,
      "percentage": 80,
      "status": "Eligible"
    },
    {
      "subject": "FLAT",
      "attended": 10,
      "total": 16,
      "percentage": 63,
      "status": "Detained"
    }
  ]
}
```

**Error Responses:**

**400 Bad Request** - Missing fields:
```json
{
  "message": "Registration number and date of birth are required"
}
```

**401 Unauthorized** - Invalid credentials:
```json
{
  "message": "Invalid registration number or date of birth"
}
```

---

## 📢 Announcements Endpoints

### 3. Create Announcement (CR Only)

**Endpoint:** `POST /api/announcements`

**Access:** CR only (JWT required)

**Description:** Create a new announcement visible to all students.

**Request Body:**
```json
{
  "title": "Important Notice",
  "message": "All students are requested to attend the seminar on January 25th."
}
```

**Request Headers:**
```
Authorization: Bearer <CR_JWT_TOKEN>
Content-Type: application/json
```

**Success Response (201):**
```json
{
  "message": "Announcement created successfully",
  "announcement": {
    "id": "60d5ec49f1b2c8b1f8e4e1a3",
    "title": "Important Notice",
    "message": "All students are requested to attend the seminar on January 25th.",
    "createdAt": "2026-01-22T10:30:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Missing fields:
```json
{
  "message": "Title and message are required"
}
```

**401 Unauthorized** - No token:
```json
{
  "message": "No token provided. Authorization denied."
}
```

**403 Forbidden** - Not a CR:
```json
{
  "message": "Access denied. CR role required."
}
```

---

### 4. Get All Announcements

**Endpoint:** `GET /api/announcements`

**Access:** Public (students can view)

**Description:** Retrieve all announcements sorted by newest first.

**Request Headers:**
```
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "count": 3,
  "announcements": [
    {
      "title": "Holiday Notice",
      "message": "January 26th is a public holiday.",
      "createdAt": "2026-01-22T14:00:00.000Z"
    },
    {
      "title": "Exam Schedule",
      "message": "Mid-term exams will start from February 1st.",
      "createdAt": "2026-01-22T10:30:00.000Z"
    },
    {
      "title": "Important Notice",
      "message": "All students must submit assignments by January 28th.",
      "createdAt": "2026-01-21T09:15:00.000Z"
    }
  ]
}
```

---

## 📦 Data Models

### Attendance Model
```javascript
{
  studentId: ObjectId,      // Reference to Student
  subject: String,          // One of: ME, MP, DBMS, DAA, FLAT
  attended: Number,         // Count of days present
  total: Number,            // Total classes held
  percentage: Number,       // Auto-calculated: (attended/total) * 100
  status: String,           // Auto-calculated: Eligible/Condonation/Detained
  timestamps: true
}
```

### Announcement Model
```javascript
{
  title: String,
  message: String,
  createdAt: Date,          // Auto-set to current date/time
  timestamps: true
}
```

---

## 🧪 Testing Guide

### Test CR Attendance Marking

1. **Login as CR** to get JWT token:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "CR_USERNAME",
    "password": "CR_PASSWORD"
  }'
```

2. **Mark attendance** using the token:
```bash
curl -X POST http://localhost:5000/api/attendance/mark \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "DBMS",
    "date": "2026-01-22",
    "records": [
      {"studentId": "STUDENT_ID_1", "present": true},
      {"studentId": "STUDENT_ID_2", "present": false}
    ]
  }'
```

### Test Student Lookup

```bash
curl -X POST http://localhost:5000/api/attendance/lookup \
  -H "Content-Type: application/json" \
  -d '{
    "regNo": "AU001",
    "dob": "2005-05-15"
  }'
```

### Test Announcements

1. **Create announcement** (CR only):
```bash
curl -X POST http://localhost:5000/api/announcements \
  -H "Authorization: Bearer <CR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Announcement",
    "message": "This is a test message."
  }'
```

2. **Get all announcements** (public):
```bash
curl -X GET http://localhost:5000/api/announcements
```

---

## ⚡ Key Features

✅ **Subject validation** - Only allowed subjects accepted  
✅ **Auto-calculation** - Percentage and status computed automatically  
✅ **Read-only for students** - Students can only view, not edit  
✅ **CR authentication** - JWT-based protection for CR operations  
✅ **Public announcements** - Students can read without authentication  
✅ **Error handling** - Comprehensive validation and error responses  

---

## 🚨 Important Notes

1. **No Firebase** - Using MongoDB only
2. **No student accounts** - Students use regNo + DOB for lookup
3. **Subject restrictions** - Only 5 subjects allowed
4. **Status auto-updates** - Recalculated on every attendance update
5. **CR authentication** - Must have valid JWT with role='CR'
6. **Date format** - Always use YYYY-MM-DD format
