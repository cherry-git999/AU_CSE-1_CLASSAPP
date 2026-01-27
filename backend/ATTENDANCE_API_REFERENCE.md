# 📡 Attendance System - API Reference

## Base URL
```
http://localhost:5000/api/attendance
```

---

## 1️⃣ Mark Attendance (CR Only)

### Endpoint
```
POST /mark
```

### Authentication
Required: CR JWT Token in Authorization header

### Request Body
```json
{
  "subject": "DBMS",
  "date": "2026-01-27",
  "records": [
    {
      "studentId": "67979c40a3fe6b820cf31c01",
      "status": "Present"
    },
    {
      "studentId": "67979c40a3fe6b820cf31c02",
      "status": "Absent"
    }
  ]
}
```

### Validations
- ✅ Date format: YYYY-MM-DD
- ✅ Subject: ME, MP, DBMS, DAA, FLAT
- ✅ Status: "Present" or "Absent"
- ✅ No duplicates for same date + subject

### Success Response (200)
```json
{
  "message": "Attendance marking completed",
  "subject": "DBMS",
  "date": "2026-01-27",
  "processed": 2,
  "errors": 0,
  "results": [
    {
      "studentId": "...",
      "regNo": "URK21CS1001",
      "name": "Student Name",
      "subject": "DBMS",
      "attended": 8,
      "total": 10,
      "percentage": 80,
      "status": "Eligible"
    }
  ],
  "failedRecords": []
}
```

### Error Response (400)
```json
{
  "message": "Attendance already marked for DBMS on 2026-01-27"
}
```

---

## 2️⃣ View All Students Attendance (CR Only)

### Endpoint
```
GET /all
```

### Authentication
Required: CR JWT Token

### Success Response (200)
```json
{
  "count": 50,
  "data": [
    {
      "regNo": "URK21CS1001",
      "name": "Student Name",
      "ME": {
        "attended": 10,
        "total": 12,
        "percentage": 83,
        "status": "Eligible"
      },
      "MP": { ... },
      "DBMS": { ... },
      "DAA": { ... },
      "FLAT": { ... }
    }
  ]
}
```

---

## 3️⃣ View Attendance by Date (CR Only) 🆕

### Endpoint
```
GET /by-date?date=YYYY-MM-DD&subject=DBMS
```

### Authentication
Required: CR JWT Token

### Query Parameters
| Parameter | Required | Type   | Description              |
|-----------|----------|--------|--------------------------|
| date      | Yes      | String | Format: YYYY-MM-DD       |
| subject   | No       | String | ME, MP, DBMS, DAA, FLAT  |

### Example Requests
```
GET /by-date?date=2026-01-27
GET /by-date?date=2026-01-27&subject=DBMS
```

### Success Response (200)
```json
{
  "date": "2026-01-27",
  "subject": "DBMS",
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

### No Data Response (200)
```json
{
  "date": "2026-01-27",
  "subject": "All subjects",
  "message": "No attendance records found for this date",
  "data": []
}
```

---

## 4️⃣ Student Attendance Lookup (Public)

### Endpoint
```
POST /lookup
```

### Authentication
None (Public endpoint, validates using regNo + DOB)

### Request Body (Overall Attendance)
```json
{
  "regNo": "URK21CS1001",
  "dob": "2003-05-15"
}
```

### Request Body (Date-Specific) 🆕
```json
{
  "regNo": "URK21CS1001",
  "dob": "2003-05-15",
  "date": "2026-01-27"
}
```

### Success Response - Overall (200)
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
    },
    {
      "subject": "DAA",
      "attended": 15,
      "total": 20,
      "percentage": 75,
      "status": "Eligible"
    }
  ]
}
```

### Success Response - Date-Specific (200) 🆕
```json
{
  "name": "Student Name",
  "regNo": "URK21CS1001",
  "date": "2026-01-27",
  "subjects": [
    {
      "subject": "DBMS",
      "status": "Present"
    },
    {
      "subject": "DAA",
      "status": "Absent"
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

### Error Response (401)
```json
{
  "message": "Invalid registration number or date of birth"
}
```

---

## Status Calculation Logic

### Percentage Calculation
```
percentage = (attended / total) * 100
```

### Status Determination
| Percentage | Status       |
|------------|--------------|
| ≥ 75%      | Eligible     |
| 65% - 74%  | Condonation  |
| < 65%      | Detained     |

---

## Error Codes

| Code | Description                          |
|------|--------------------------------------|
| 200  | Success                              |
| 400  | Bad Request (validation error)       |
| 401  | Unauthorized (invalid credentials)   |
| 403  | Forbidden (not CR)                   |
| 500  | Internal Server Error                |

---

## Common Error Messages

### Validation Errors (400)
- "Subject, date, and records array are required"
- "Invalid subject. Allowed subjects: ME, MP, DBMS, DAA, FLAT"
- "Invalid date format. Use YYYY-MM-DD"
- "Records array cannot be empty"
- "Attendance already marked for [subject] on [date]"
- "Status must be \"Present\" or \"Absent\""

### Authentication Errors (401)
- "Invalid registration number or date of birth"
- "No token provided"
- "Invalid token"

---

## Sample cURL Commands

### Mark Attendance
```bash
curl -X POST http://localhost:5000/api/attendance/mark \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "DBMS",
    "date": "2026-01-27",
    "records": [
      {"studentId": "67979c40a3fe6b820cf31c01", "status": "Present"}
    ]
  }'
```

### View by Date
```bash
curl -X GET "http://localhost:5000/api/attendance/by-date?date=2026-01-27&subject=DBMS" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Student Lookup
```bash
curl -X POST http://localhost:5000/api/attendance/lookup \
  -H "Content-Type: application/json" \
  -d '{
    "regNo": "URK21CS1001",
    "dob": "2003-05-15",
    "date": "2026-01-27"
  }'
```

---

## Integration Notes

### Frontend Integration
```javascript
// Mark attendance
const response = await axios.post('/api/attendance/mark', {
  subject: 'DBMS',
  date: '2026-01-27',
  records: attendanceData
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// View by date
const dateData = await axios.get(
  `/api/attendance/by-date?date=${date}&subject=${subject}`,
  { headers: { Authorization: `Bearer ${token}` }}
);

// Student lookup with date
const studentData = await axios.post('/api/attendance/lookup', {
  regNo,
  dob,
  date: selectedDate
});
```

---

## Database Collections Used

1. **DailyAttendance** - Date-wise records (NEW)
2. **Attendance** - Cumulative summary
3. **Student** - Student information

---

## Rate Limiting

Currently: None  
Recommended: 100 requests/minute per IP

---

## Version History

- **v1.0** - Initial implementation (old system)
- **v2.0** - Date-wise attendance with duplicate prevention 🆕

---

## Support

For issues or questions:
- Check error messages in response
- Verify JWT token is valid
- Ensure date format is YYYY-MM-DD
- Confirm student IDs exist in database
