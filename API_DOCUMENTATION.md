# Backend API Response Formats

This document specifies the expected response formats from the backend API.

## Authentication

### POST `/auth/login`

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "12345",
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Response (Error - 401):**
```json
{
  "message": "Invalid credentials"
}
```

---

## Students

### GET `/students`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
[
  {
    "_id": "student123",
    "name": "John Doe",
    "regNo": "21BCS001",
    "email": "john@example.com",
    "dateOfBirth": "2003-05-15T00:00:00.000Z"
  },
  {
    "_id": "student124",
    "name": "Jane Smith",
    "regNo": "21BCS002",
    "email": "jane@example.com",
    "dateOfBirth": "2003-08-20T00:00:00.000Z"
  }
]
```

---

## Attendance

### POST `/attendance/lookup`

**Request:**
```json
{
  "regNo": "21BCS001",
  "dateOfBirth": "2003-05-15"
}
```

**Response (Success - 200):**
```json
{
  "studentName": "John Doe",
  "regNo": "21BCS001",
  "subjects": [
    {
      "name": "Data Structures",
      "attended": 35,
      "total": 40,
      "percentage": 87.5
    },
    {
      "name": "Database Management",
      "attended": 28,
      "total": 38,
      "percentage": 73.68
    }
  ],
  "overallPercentage": 80.5,
  "status": "Eligible"
}
```

**Status values:** `"Eligible"`, `"Condonation"`, `"Detained"`

**Response (Error - 404):**
```json
{
  "message": "Student not found or invalid credentials"
}
```

---

### GET `/attendance`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
[
  {
    "_id": "att123",
    "studentName": "John Doe",
    "regNo": "21BCS001",
    "subject": "Data Structures",
    "attended": 35,
    "total": 40,
    "percentage": 87.5,
    "status": "Eligible"
  },
  {
    "_id": "att124",
    "studentName": "John Doe",
    "regNo": "21BCS001",
    "subject": "Database Management",
    "attended": 25,
    "total": 38,
    "percentage": 65.79,
    "status": "Condonation"
  }
]
```

---

### PUT `/attendance/update`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "id": "att123",
  "attended": 36,
  "total": 41
}
```

**Response (Success - 200):**
```json
{
  "message": "Attendance updated successfully",
  "attendance": {
    "_id": "att123",
    "attended": 36,
    "total": 41,
    "percentage": 87.8,
    "status": "Eligible"
  }
}
```

---

## Leave Requests

### GET `/leaves`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
[
  {
    "_id": "leave123",
    "studentName": "John Doe",
    "regNo": "21BCS001",
    "startDate": "2024-02-01T00:00:00.000Z",
    "endDate": "2024-02-03T00:00:00.000Z",
    "reason": "Medical emergency",
    "status": "Pending"
  },
  {
    "_id": "leave124",
    "studentName": "Jane Smith",
    "regNo": "21BCS002",
    "startDate": "2024-02-05T00:00:00.000Z",
    "endDate": "2024-02-06T00:00:00.000Z",
    "reason": "Family function",
    "status": "Approved"
  }
]
```

**Status values:** `"Pending"`, `"Approved"`, `"Rejected"`

---

### PUT `/leaves/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "status": "Approved"
}
```

**Response (Success - 200):**
```json
{
  "message": "Leave status updated successfully",
  "leave": {
    "_id": "leave123",
    "status": "Approved"
  }
}
```

---

## Announcements

### GET `/announcements`

**Response (Success - 200):**
```json
[
  {
    "_id": "ann123",
    "title": "Class Test Scheduled",
    "content": "Class test for Data Structures will be held on 15th Feb 2024.",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "createdBy": "Admin Name"
  },
  {
    "_id": "ann124",
    "title": "Holiday Notice",
    "content": "College will remain closed on 26th Jan 2024.",
    "createdAt": "2024-01-18T14:20:00.000Z",
    "createdBy": "Admin Name"
  }
]
```

---

### POST `/announcements`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Important Notice",
  "content": "All students are requested to attend the seminar on 25th Jan."
}
```

**Response (Success - 201):**
```json
{
  "_id": "ann125",
  "title": "Important Notice",
  "content": "All students are requested to attend the seminar on 25th Jan.",
  "createdAt": "2024-01-21T09:15:00.000Z",
  "createdBy": "Admin Name"
}
```

---

## Error Responses

All endpoints should return appropriate error responses:

**400 - Bad Request:**
```json
{
  "message": "Invalid input data"
}
```

**401 - Unauthorized:**
```json
{
  "message": "Unauthorized access"
}
```

**404 - Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error"
}
```

---

## Notes

1. All dates should be in ISO 8601 format
2. JWT tokens should be returned without "Bearer" prefix
3. Status calculations on frontend:
   - Eligible: percentage >= 75
   - Condonation: 65 <= percentage < 75
   - Detained: percentage < 65
4. All protected routes require `Authorization: Bearer <token>` header
5. CORS should be enabled for the frontend origin
