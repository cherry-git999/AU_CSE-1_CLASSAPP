# Quick Test Commands

## Setup
Make sure your backend is running on port 5000 and you have MongoDB connected.

## 1. Test CR Login (Get JWT Token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"YOUR_CR_USERNAME\", \"password\": \"YOUR_CR_PASSWORD\"}"
```

**Save the token from the response!**

---

## 2. Test Mark Attendance (CR Only)

Replace `<YOUR_JWT_TOKEN>` with the token from step 1.
Replace `<STUDENT_ID>` with actual student ObjectId from your database.

```bash
curl -X POST http://localhost:5000/api/attendance/mark \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{
    \"subject\": \"DBMS\",
    \"date\": \"2026-01-22\",
    \"records\": [
      {\"studentId\": \"<STUDENT_ID>\", \"present\": true}
    ]
  }"
```

**Expected Result:** Attendance marked successfully with updated stats.

---

## 3. Test Student Attendance Lookup (Public)

Replace with actual student registration number and date of birth:

```bash
curl -X POST http://localhost:5000/api/attendance/lookup \
  -H "Content-Type: application/json" \
  -d "{\"regNo\": \"AU001\", \"dob\": \"2005-05-15\"}"
```

**Expected Result:** Student name, regNo, and subject-wise attendance.

---

## 4. Test Create Announcement (CR Only)

Replace `<YOUR_JWT_TOKEN>` with the CR token:

```bash
curl -X POST http://localhost:5000/api/announcements \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"Test Announcement\", \"message\": \"This is a test message for all students.\"}"
```

**Expected Result:** Announcement created successfully.

---

## 5. Test Get Announcements (Public)

```bash
curl -X GET http://localhost:5000/api/announcements
```

**Expected Result:** List of all announcements sorted by newest first.

---

## 6. Test Subject Validation

Try marking attendance with an invalid subject (should fail):

```bash
curl -X POST http://localhost:5000/api/attendance/mark \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{
    \"subject\": \"NCC\",
    \"date\": \"2026-01-22\",
    \"records\": [
      {\"studentId\": \"<STUDENT_ID>\", \"present\": true}
    ]
  }"
```

**Expected Result:** Error message: "Invalid subject. Allowed subjects: ME, MP, DBMS, DAA, FLAT"

---

## PowerShell Version (Windows)

If using PowerShell, use these commands instead:

### Mark Attendance
```powershell
$headers = @{
    "Authorization" = "Bearer <YOUR_JWT_TOKEN>"
    "Content-Type" = "application/json"
}

$body = @{
    subject = "DBMS"
    date = "2026-01-22"
    records = @(
        @{
            studentId = "<STUDENT_ID>"
            present = $true
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/attendance/mark" -Method POST -Headers $headers -Body $body
```

### Create Announcement
```powershell
$headers = @{
    "Authorization" = "Bearer <YOUR_JWT_TOKEN>"
    "Content-Type" = "application/json"
}

$body = @{
    title = "Test Announcement"
    message = "This is a test message"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/announcements" -Method POST -Headers $headers -Body $body
```

### Get Announcements
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/announcements" -Method GET
```

### Student Lookup
```powershell
$body = @{
    regNo = "AU001"
    dob = "2005-05-15"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/attendance/lookup" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

---

## Notes

1. **Get Student IDs:** Query your MongoDB to get actual student ObjectIds
2. **Get CR Token:** You need valid CR credentials to test protected endpoints
3. **Valid Subjects Only:** ME, MP, DBMS, DAA, FLAT
4. **Date Format:** Always use YYYY-MM-DD
5. **Student Lookup:** No authentication needed, just regNo + DOB
