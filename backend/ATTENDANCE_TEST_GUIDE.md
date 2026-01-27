# 🧪 Attendance System - Quick Test Guide

## Prerequisites
1. Backend server running on `http://localhost:5000`
2. CR authenticated (JWT token available)
3. Students exist in database

---

## Test Scenario 1: Mark Attendance (CR)

### ✅ First-time marking (should succeed)
```bash
POST http://localhost:5000/api/attendance/mark
Authorization: Bearer <YOUR_CR_JWT_TOKEN>
Content-Type: application/json

{
  "subject": "DBMS",
  "date": "2026-01-27",
  "records": [
    {
      "studentId": "REPLACE_WITH_REAL_STUDENT_ID",
      "status": "Present"
    },
    {
      "studentId": "REPLACE_WITH_REAL_STUDENT_ID",
      "status": "Absent"
    }
  ]
}
```

**Expected Response:**
```json
{
  "message": "Attendance marking completed",
  "subject": "DBMS",
  "date": "2026-01-27",
  "processed": 2,
  "errors": 0,
  "results": [...]
}
```

---

### ❌ Duplicate marking (should fail)
Run the same request again.

**Expected Response:**
```json
{
  "message": "Attendance already marked for DBMS on 2026-01-27"
}
```

---

## Test Scenario 2: Student Date Lookup

### Student views attendance for specific date
```bash
POST http://localhost:5000/api/attendance/lookup
Content-Type: application/json

{
  "regNo": "URK21CS1001",
  "dob": "2003-05-15",
  "date": "2026-01-27"
}
```

**Expected Response:**
```json
{
  "name": "Student Name",
  "regNo": "URK21CS1001",
  "date": "2026-01-27",
  "subjects": [
    {
      "subject": "DBMS",
      "status": "Present"
    }
  ],
  "overallAttendance": [
    {
      "subject": "DBMS",
      "attended": 8,
      "total": 10,
      "percentage": 80,
      "status": "Eligible"
    }
  ]
}
```

---

### Student views overall attendance (no date)
```bash
POST http://localhost:5000/api/attendance/lookup
Content-Type: application/json

{
  "regNo": "URK21CS1001",
  "dob": "2003-05-15"
}
```

**Expected Response:**
```json
{
  "name": "Student Name",
  "regNo": "URK21CS1001",
  "attendance": [
    {
      "subject": "DBMS",
      "attended": 8,
      "total": 10,
      "percentage": 80,
      "status": "Eligible"
    }
  ]
}
```

---

## Test Scenario 3: CR Views Date-Based Attendance

### All subjects on a date
```bash
GET http://localhost:5000/api/attendance/by-date?date=2026-01-27
Authorization: Bearer <YOUR_CR_JWT_TOKEN>
```

**Expected Response:**
```json
{
  "date": "2026-01-27",
  "subject": "All subjects",
  "count": 50,
  "data": [
    {
      "regNo": "URK21CS1001",
      "name": "Student Name",
      "subject": "DBMS",
      "status": "Present",
      "attended": 8,
      "total": 10,
      "percentage": 80,
      "overallStatus": "Eligible"
    }
  ]
}
```

---

### Specific subject on a date
```bash
GET http://localhost:5000/api/attendance/by-date?date=2026-01-27&subject=DBMS
Authorization: Bearer <YOUR_CR_JWT_TOKEN>
```

**Expected Response:**
```json
{
  "date": "2026-01-27",
  "subject": "DBMS",
  "count": 50,
  "data": [...]
}
```

---

## Test Scenario 4: Validation Checks

### ❌ Invalid date format
```bash
POST http://localhost:5000/api/attendance/mark
Authorization: Bearer <YOUR_CR_JWT_TOKEN>
Content-Type: application/json

{
  "subject": "DBMS",
  "date": "27-01-2026",
  "records": [...]
}
```

**Expected:** `400 Bad Request` - "Invalid date format. Use YYYY-MM-DD"

---

### ❌ Invalid subject
```bash
POST http://localhost:5000/api/attendance/mark
Authorization: Bearer <YOUR_CR_JWT_TOKEN>
Content-Type: application/json

{
  "subject": "PHYSICS",
  "date": "2026-01-27",
  "records": [...]
}
```

**Expected:** `400 Bad Request` - "Invalid subject. Allowed subjects: ME, MP, DBMS, DAA, FLAT"

---

### ❌ Invalid status
```bash
POST http://localhost:5000/api/attendance/mark
Authorization: Bearer <YOUR_CR_JWT_TOKEN>
Content-Type: application/json

{
  "subject": "DBMS",
  "date": "2026-01-27",
  "records": [
    {
      "studentId": "...",
      "status": "Maybe"
    }
  ]
}
```

**Expected:** Error in response for that student

---

## Test Scenario 5: Edge Cases

### No attendance for date
```bash
GET http://localhost:5000/api/attendance/by-date?date=2025-01-01
Authorization: Bearer <YOUR_CR_JWT_TOKEN>
```

**Expected Response:**
```json
{
  "date": "2025-01-01",
  "subject": "All subjects",
  "message": "No attendance records found for this date",
  "data": []
}
```

---

## MongoDB Verification

### Check DailyAttendance collection
```javascript
// In MongoDB shell or Compass
db.dailyattendances.find({ date: "2026-01-27" }).pretty()
```

### Verify unique index
```javascript
// Try to create duplicate - should fail
db.dailyattendances.insertOne({
  date: "2026-01-27",
  subject: "DBMS",
  records: []
})
// Should get: E11000 duplicate key error
```

---

## Common Issues & Solutions

### Issue: "Attendance already marked"
**Solution:** This is correct behavior. Each date+subject can only be marked once.

### Issue: Student ID not found
**Solution:** Verify student exists using:
```bash
GET http://localhost:5000/api/students/all
```

### Issue: JWT token expired
**Solution:** Login again as CR to get new token:
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "cr@gmail.com",
  "password": "cr123"
}
```

---

## Success Indicators

✅ First marking succeeds  
✅ Duplicate marking fails with clear message  
✅ Student can view date-specific attendance  
✅ CR can filter by date and subject  
✅ Percentages calculate automatically  
✅ Status updates (Eligible/Condonation/Detained)  
✅ Historical data persists  

---

## Database State After Test

After marking attendance, you should see:
1. **DailyAttendance** - One document per date+subject
2. **Attendance** - Updated totals and percentages
3. Student records with correct status
