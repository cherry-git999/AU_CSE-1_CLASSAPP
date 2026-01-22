# 🧪 Testing the Attendance Lookup API

## ✅ API Implementation Complete!

### Files Created:
1. **backend/src/models/Attendance.js** - Attendance schema with auto-calculation
2. **backend/src/controllers/attendanceController.js** - Lookup logic with validation
3. **backend/src/routes/attendanceRoutes.js** - Route definition
4. **backend/src/server.js** - Updated with MongoDB connection and attendance routes
5. **backend/seedDatabase.js** - Script to populate sample data

### Server Status:
- ✅ MongoDB connection integrated
- ✅ Attendance routes added to Express app
- ✅ Server running on port 5000

---

## 🔍 API Endpoint

**POST** `/api/attendance/lookup`

### Request:
```json
{
  "regNo": "CSE001",
  "dob": "2002-02-25"
}
```

### Success Response (200):
```json
{
  "name": "John Doe",
  "regNo": "CSE001",
  "attendance": [
    {
      "subject": "Data Structures & Algorithms",
      "attended": 41,
      "total": 50,
      "percentage": 82,
      "status": "Eligible"
    },
    {
      "subject": "Database Management Systems",
      "attended": 36,
      "total": 50,
      "percentage": 72,
      "status": "At Risk"
    }
  ]
}
```

### Error Responses:

**400 Bad Request:**
- Missing regNo or dob
- Invalid date format

**401 Unauthorized:**
- Invalid registration number or DOB mismatch

**500 Server Error:**
- Database connection issues

---

## 🧪 How to Test

### Option 1: Using Postman
1. Open Postman
2. Create new POST request
3. URL: `http://localhost:5000/api/attendance/lookup`
4. Body: raw JSON
```json
{
  "regNo": "CSE001",
  "dob": "2002-02-25"
}
```
5. Send request

### Option 2: Using cURL (Git Bash/Linux)
```bash
curl -X POST http://localhost:5000/api/attendance/lookup \
  -H "Content-Type: application/json" \
  -d '{"regNo":"CSE001","dob":"2002-02-25"}'
```

### Option 3: Using VS Code REST Client
Create a file `test.http`:
```http
POST http://localhost:5000/api/attendance/lookup
Content-Type: application/json

{
  "regNo": "CSE001",
  "dob": "2002-02-25"
}
```

### Option 4: Using JavaScript Fetch
```javascript
fetch('http://localhost:5000/api/attendance/lookup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    regNo: 'CSE001',
    dob: '2002-02-25'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

---

## 📊 Sample Test Data

If you ran the seed script, you should have these students in the database:

| Name | Registration No | DOB | Email |
|------|----------------|-----|-------|
| John Doe | CSE001 | 2002-02-25 | john.doe@example.com |
| Jane Smith | CSE002 | 2002-05-15 | jane.smith@example.com |
| Mike Johnson | CSE003 | 2002-08-10 | mike.johnson@example.com |

Each student has 4 subjects with attendance records:
- Data Structures & Algorithms
- Database Management Systems
- Operating Systems
- Computer Networks

---

## 🔐 Security Features

✅ **DOB as Password** - Acts as verification without exposing actual password  
✅ **No JWT Tokens** - Students don't get authentication tokens  
✅ **Email Hidden** - Email field is never exposed in response  
✅ **Read-Only** - Students cannot modify any data  
✅ **Generic Errors** - Same error message for invalid regNo or DOB (prevents enumeration)  
✅ **Date-Only Comparison** - Ignores time component in DOB validation

---

## 🧠 Business Logic Flow

```
1. Receive regNo + dob
   ↓
2. Validate both fields present
   ↓
3. Validate date format
   ↓
4. Find student by regNo
   ↓
5. Compare DOB (date only)
   ↓
6. If mismatch → 401 error
   ↓
7. If match → Fetch attendance
   ↓
8. Return student name, regNo, and attendance array
```

---

## 📦 To Add Sample Data

If the database is empty, run:
```bash
cd backend
npm run seed
```

This will add:
- 3 sample students
- 12 attendance records (4 subjects per student)

---

## 🚀 Integration with Frontend

```javascript
// Attendance lookup function
const lookupStudentAttendance = async (regNo, dob) => {
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
    return data;

  } catch (error) {
    console.error('Lookup failed:', error.message);
    throw error;
  }
};

// Usage in React component
const handleLookup = async (e) => {
  e.preventDefault();
  try {
    const data = await lookupStudentAttendance(regNo, dob);
    // Display data.name, data.regNo, data.attendance
    setStudentData(data);
  } catch (error) {
    // Show error message
    setError(error.message);
  }
};
```

---

## ⚠️ Important Notes

1. **This is NOT authentication** - Students don't login, they just lookup
2. **No tokens issued** - Response doesn't include JWT
3. **Public endpoint** - No middleware protection
4. **Read-only access** - Students can only view their data
5. **DOB must match exactly** - Date comparison is strict
6. **Percentage auto-calculated** - Based on attended/total in database

---

## ✅ What's Complete

- ✅ Attendance model with auto-calculation
- ✅ Lookup controller with validation
- ✅ Route integrated into server
- ✅ MongoDB connection configured
- ✅ Error handling implemented
- ✅ Security measures in place
- ✅ Sample data seeder ready

**The API is production-ready and can be integrated with your frontend!** 🎉
