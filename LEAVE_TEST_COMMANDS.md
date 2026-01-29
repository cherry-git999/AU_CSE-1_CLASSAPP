# Leave Request System - Test Commands

## Test 1: Check Backend Health
```bash
curl http://localhost:5000/
```

## Test 2: Create a Test Leave Request
Replace with actual student data from your database:
```bash
curl -X POST http://localhost:5000/api/leaves \
  -H "Content-Type: application/json" \
  -d '{
    "regNo": "URK21CS1001",
    "dob": "2003-05-15",
    "startDate": "2026-02-01",
    "endDate": "2026-02-03",
    "reason": "Medical emergency - need to visit doctor"
  }'
```

## Test 3: Get All Leaves (CR View)
```bash
curl http://localhost:5000/api/leaves
```

## Test 4: Get Student's Own Leaves
```bash
curl "http://localhost:5000/api/leaves?regNo=URK21CS1001&dob=2003-05-15"
```

## Test 5: Login as CR (Get Token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cr@example.com",
    "password": "password123"
  }'
```

## Test 6: Approve Leave Request (Replace TOKEN and LEAVE_ID)
```bash
curl -X PUT http://localhost:5000/api/leaves/LEAVE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "Approved"
  }'
```

## Test 7: Reject Leave Request
```bash
curl -X PUT http://localhost:5000/api/leaves/LEAVE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "Rejected"
  }'
```

## PowerShell Commands (Windows)

### Test Backend Health
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get
```

### Create Leave Request
```powershell
$body = @{
    regNo = "URK21CS1001"
    dob = "2003-05-15"
    startDate = "2026-02-01"
    endDate = "2026-02-03"
    reason = "Medical emergency - need to visit doctor"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/leaves" -Method Post -Body $body -ContentType "application/json"
```

### Get All Leaves
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/leaves" -Method Get
```

### Login as CR
```powershell
$loginBody = @{
    email = "cr@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
Write-Host "Token: $token"
```

### Approve Leave (after getting token and leave ID)
```powershell
$headers = @{
    Authorization = "Bearer $token"
}
$statusBody = @{
    status = "Approved"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/leaves/LEAVE_ID" -Method Put -Body $statusBody -ContentType "application/json" -Headers $headers
```

## Manual Testing Steps

### For Students:
1. Open http://localhost:5173/student/login
2. Login with your regNo and DOB
3. Navigate to "Leaves" section
4. Click "+ Apply for Leave"
5. Fill in the dates and reason
6. Submit the form
7. Check if it appears in your leaves list

### For CR/Admin:
1. Open http://localhost:5173/admin/login
2. Login with CR credentials
3. Navigate to "Leaves" section
4. You should see all student leave requests
5. Click "Approve" or "Reject" for pending leaves
6. Verify the status updates immediately

## Expected Results

### Successful Leave Creation:
```json
{
  "message": "Leave request submitted successfully",
  "leaveRequest": {
    "id": "...",
    "studentName": "John Doe",
    "regNo": "URK21CS1001",
    "startDate": "2026-02-01T00:00:00.000Z",
    "endDate": "2026-02-03T00:00:00.000Z",
    "reason": "Medical emergency - need to visit doctor",
    "status": "Pending",
    "createdAt": "..."
  }
}
```

### Successful Status Update:
```json
{
  "message": "Leave request approved successfully",
  "leaveRequest": {
    "id": "...",
    "studentName": "John Doe",
    "regNo": "URK21CS1001",
    "startDate": "2026-02-01T00:00:00.000Z",
    "endDate": "2026-02-03T00:00:00.000Z",
    "reason": "Medical emergency - need to visit doctor",
    "status": "Approved",
    "reviewedAt": "..."
  }
}
```
