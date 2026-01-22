# 📊 Student Attendance Lookup API

## Overview

Public, read-only API that allows students to view their attendance by providing their registration number and date of birth. **This is NOT authentication** - students do not get accounts or tokens.

## 🔍 Endpoint

### Lookup Student Attendance

**POST** `/api/attendance/lookup`

**Description:** Returns student information and attendance records for students who provide valid registration number and DOB.

**Access:** Public (no authentication required)

**Request Body:**
```json
{
  "regNo": "CSE001",
  "dob": "2002-02-25"
}
```

**Success Response (200):**
```json
{
  "name": "Student1",
  "regNo": "CSE001",
  "attendance": [
    {
      "subject": "DSA",
      "attended": 41,
      "total": 50,
      "percentage": 82,
      "status": "Eligible"
    },
    {
      "subject": "DBMS",
      "attended": 36,
      "total": 50,
      "percentage": 72,
      "status": "At Risk"
    }
  ]
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "message": "Registration number and date of birth are required"
}
```
OR
```json
{
  "message": "Invalid date format. Use YYYY-MM-DD"
}
```

**401 Unauthorized:**
```json
{
  "message": "Invalid registration number or date of birth"
}
```

**500 Server Error:**
```json
{
  "message": "Server error during attendance lookup"
}
```

## 🧠 Business Logic

### Validation Flow:
1. Validate that both `regNo` and `dob` are provided
2. Validate date format (YYYY-MM-DD)
3. Find student by registration number
4. Compare provided DOB with stored DOB (date only, ignore time)
5. If mismatch → 401 error
6. If match → fetch attendance and return data

### Attendance Status Rules:
- **Eligible**: Percentage ≥ 75%
- **At Risk**: 65% ≤ Percentage < 75%
- **Not Eligible**: Percentage < 65%

### Security Features:
- ✅ DOB validation acts as password verification
- ✅ Email is NOT exposed in response
- ✅ No JWT tokens issued
- ✅ Read-only access
- ✅ Same error message for invalid regNo or DOB (prevents enumeration)

## 📁 Files Created

```
backend/src/
├── models/
│   ├── Student.js           ✅ Student schema (existing)
│   └── Attendance.js        ✅ Attendance schema with auto-calc
├── controllers/
│   └── attendanceController.js  ✅ Lookup logic
└── routes/
    └── attendanceRoutes.js      ✅ Attendance endpoints
```

## 🗄️ Database Schema

### Students Collection
```javascript
{
  name: String,
  regNo: String (unique),
  dob: Date,
  email: String
}
```

### Attendance Collection
```javascript
{
  studentId: ObjectId (ref: Student),
  subject: String,
  attended: Number,
  total: Number,
  percentage: Number (auto-calculated),
  status: String (auto-calculated)
}
```

## 🧪 Testing

### Test 1: Valid Lookup
```bash
POST http://localhost:5000/api/attendance/lookup
Content-Type: application/json

{
  "regNo": "CSE001",
  "dob": "2002-02-25"
}
```

### Test 2: Invalid Registration Number
```bash
POST http://localhost:5000/api/attendance/lookup
Content-Type: application/json

{
  "regNo": "INVALID123",
  "dob": "2002-02-25"
}
```

### Test 3: Wrong DOB
```bash
POST http://localhost:5000/api/attendance/lookup
Content-Type: application/json

{
  "regNo": "CSE001",
  "dob": "2000-01-01"
}
```

### Test 4: Missing Fields
```bash
POST http://localhost:5000/api/attendance/lookup
Content-Type: application/json

{
  "regNo": "CSE001"
}
```

## 🎨 Frontend Integration

```javascript
// Student attendance lookup
const lookupAttendance = async (regNo, dob) => {
  try {
    const response = await fetch('http://localhost:5000/api/attendance/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regNo, dob })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const data = await response.json();
    return data; // { name, regNo, attendance: [...] }
    
  } catch (error) {
    console.error('Attendance lookup failed:', error.message);
    throw error;
  }
};

// Usage
lookupAttendance('CSE001', '2002-02-25')
  .then(data => {
    console.log(`Welcome ${data.name}`);
    console.log('Your Attendance:', data.attendance);
  })
  .catch(err => console.error('Error:', err.message));
```

## 📊 Sample Data Structure

To insert sample data for testing:

```javascript
// Sample Student
{
  "name": "John Doe",
  "regNo": "CSE001",
  "dob": "2002-02-25",
  "email": "john.doe@example.com"
}

// Sample Attendance Records
{
  "studentId": "65f1234567890abcdef12345", // Student's ObjectId
  "subject": "Data Structures",
  "attended": 41,
  "total": 50,
  "percentage": 82,  // Auto-calculated
  "status": "Eligible"  // Auto-calculated
}
```

## ⚠️ Important Notes

1. **Not Authentication**: This is a lookup system, not a login system
2. **No Tokens**: Students do NOT receive JWT tokens
3. **Read-Only**: Students cannot modify data through this API
4. **No Email Exposure**: Email field is never returned
5. **Public Access**: No middleware protection on this route
6. **DOB Format**: Must be YYYY-MM-DD (ISO 8601)

## 🔗 Related APIs

- **CR Login**: `POST /api/auth/login` (requires authentication)
- **Health Check**: `GET /` (shows MongoDB status)

---

✅ **API is ready to use!**
