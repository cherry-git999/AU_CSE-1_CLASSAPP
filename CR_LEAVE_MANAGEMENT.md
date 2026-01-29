# CR Leave Management System

## Overview
The Class Representative (CR) can now view, approve, and deny student leave requests through the admin panel.

## How to Access

### For CR/Admin:
1. Go to the admin login page: `/admin/login`
2. Login with your CR credentials (email and password)
3. Navigate to **Leaves** from the sidebar menu

## Features for CR

### View All Leave Requests
- See all leave requests from all students
- View student name, registration number, dates, and reason
- See the current status (Pending, Approved, Rejected)

### Approve/Deny Leaves
- For each **Pending** leave request, you'll see two buttons:
  - **Approve** (green button) - Click to approve the leave
  - **Reject** (red button) - Click to deny the leave
- Once a leave is approved or rejected:
  - The status updates immediately
  - You'll see a success message
  - The action buttons disappear (can't change status again)

## Features for Students

### Apply for Leave
1. Login through student portal: `/student/login`
2. Navigate to **Leaves** section
3. Click **"+ Apply for Leave"** button
4. Fill in the form:
   - Registration Number (pre-filled)
   - Date of Birth (pre-filled)
   - Start Date
   - End Date
   - Reason for Leave
5. Click **"Submit Leave Request"**

### View Leave Status
- Students can view all their submitted leave requests
- See the current status: Pending, Approved, or Rejected
- View submission date and review date

## Important Notes

### For Students:
- ✅ Registration number and date of birth are automatically filled from your profile
- ✅ Dates must be valid (end date after start date)
- ✅ All fields are required
- ✅ You can only view your own leave requests

### For CR/Admin:
- ✅ You can see ALL leave requests from all students
- ✅ You can only approve/reject pending requests
- ✅ Once a status is set (Approved/Rejected), it cannot be changed
- ✅ The system logs the review date and reviewer (CR)

## API Endpoints

### Student Endpoints
- `POST /api/leaves` - Create a new leave request
- `GET /api/leaves?regNo=XXX&dob=YYYY-MM-DD` - Get student's own leaves

### CR/Admin Endpoints (JWT Protected)
- `GET /api/leaves` - Get all leave requests
- `PUT /api/leaves/:id` - Update leave status (Approve/Reject)
- `DELETE /api/leaves/:id` - Delete a leave request

## Troubleshooting

### "Server error while creating leave request"
**Fixed!** This error has been resolved by:
1. ✅ Better DOB validation and comparison
2. ✅ Enhanced error messages showing exact issue
3. ✅ Added null checks for student DOB field
4. ✅ Better date parsing and formatting
5. ✅ Console logging for debugging

### Common Issues:
1. **"Invalid registration number or date of birth"**
   - Verify the student exists in the database
   - Check that the DOB matches exactly with records

2. **"Student record is missing date of birth"**
   - Contact administrator to update student record
   - Student data needs to be properly imported with DOB

3. **"End date must be after start date"**
   - Check the selected dates
   - End date should be the same or later than start date

## Status Color Coding
- 🟢 **Green** - Approved
- 🔴 **Red** - Rejected
- 🟡 **Yellow/Orange** - Pending

## Security
- Students use regNo + DOB for authentication (no JWT needed)
- CR/Admin must be logged in with JWT token
- Students can only see their own leaves
- Only CR can approve/deny leaves
