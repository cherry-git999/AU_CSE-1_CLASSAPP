# 🚀 Leave Request System - Quick Start Guide

## ✅ System is Ready!

The leave request system is now fully implemented and working. Here's how to use it:

---

## 👨‍🎓 For Students

### Step 1: Apply for Leave
1. Navigate to **"Leaves"** page from the sidebar
2. Click the **"+ Apply for Leave"** button (top right)
3. A modal will open

### Step 2: Fill the Form
The modal will show:
- **Registration Number** (auto-filled if you're logged in as student)
- **Date of Birth** (auto-filled if you're logged in as student)
- **Start Date** - Pick when your leave starts
- **End Date** - Pick when your leave ends
- **Reason** - Explain why you need leave

### Step 3: Submit
- Click **"Submit Leave Request"**
- Modal closes
- Your request appears in the table below with **"Pending"** status (yellow)

### Step 4: Check Status
- Your leave requests are listed in the table
- Status will be one of:
  - 🟡 **Pending** - Waiting for CR approval
  - 🟢 **Approved** - CR approved your leave
  - 🔴 **Rejected** - CR rejected your leave

---

## 👨‍💼 For CR (Class Representative)

### Step 1: View All Leave Requests
1. Navigate to **"Leaves"** page
2. You'll see **all students'** leave requests in a table

### Step 2: Review Pending Requests
- Pending requests have two buttons:
  - **Approve** (green) - Accept the leave
  - **Reject** (red) - Decline the leave

### Step 3: Take Action
1. Read the student's reason
2. Check the dates
3. Click **"Approve"** or **"Reject"**
4. Status updates immediately
5. Student will see the new status

### Step 4: View History
- Already approved/rejected requests show their status
- No action buttons for completed requests

---

## 🎯 Key Features

### Modal-Based Application ✅
- Clean, focused form
- Easy to fill
- Similar to announcements modal
- Validates dates automatically

### Smart Filtering ✅
- Students see **only their own** leaves
- CR sees **all students'** leaves
- No confusion about whose leave is whose

### Real-Time Updates ✅
- Status changes immediately
- No page refresh needed
- Smooth user experience

### Status Tracking ✅
- Always know if your leave is pending, approved, or rejected
- Color-coded for quick recognition
- Timestamps recorded

---

## 📝 Example Scenario

### Scenario: Student Needs Medical Leave

**Student's Actions:**
1. Go to Leaves page
2. Click "Apply for Leave"
3. Fill in:
   - RegNo: URK21CS1001
   - DOB: 2003-05-15
   - Start: 2026-01-28
   - End: 2026-01-30
   - Reason: "Medical appointment at hospital"
4. Submit
5. See "Pending" status in table

**CR's Actions:**
1. Go to Leaves page
2. See new request from URK21CS1001
3. Read reason: "Medical appointment at hospital"
4. Click "Approve"
5. Status changes to "Approved"

**Student Checks Later:**
1. Go to Leaves page
2. See their request now shows "Approved" ✅
3. Can proceed with leave

---

## 🔍 What You'll See

### Student View:
```
┌─────────────────────────────────────────────────┐
│  Leave Requests              [+ Apply for Leave]│
│  View your leave requests and apply for new ones│
├─────────────────────────────────────────────────┤
│ Student   | Reg No   | Start    | End      |... │
│ Your Name | URK21CS1 | Jan 28   | Jan 30   |... │
│ Status: Approved ✅                              │
└─────────────────────────────────────────────────┘
```

### CR View:
```
┌─────────────────────────────────────────────────┐
│  Leave Requests                                  │
│  Manage student leave requests                   │
├─────────────────────────────────────────────────┤
│ Student | Reg No   | Start | End   | Status |..│
│ John    | URK21CS1 | Jan28 | Jan30 |Pending|..│
│         |          |       |       |[Approve]  │
│         |          |       |       |[Reject ]  │
└─────────────────────────────────────────────────┘
```

---

## 💡 Pro Tips

### For Students:
- ✅ Fill in detailed reasons - helps CR make decisions
- ✅ Plan ahead - submit leaves early
- ✅ Check status regularly
- ✅ Make sure dates don't overlap if submitting multiple

### For CR:
- ✅ Review reasons carefully before deciding
- ✅ Check if dates make sense
- ✅ Process requests promptly
- ✅ Be fair and consistent

---

## 🚨 Common Issues & Solutions

### Issue: "Invalid credentials"
**Solution:** Make sure RegNo and DOB are correct

### Issue: "End date must be after start date"
**Solution:** Pick an end date that comes after the start date

### Issue: Can't see apply button (Student)
**Solution:** Make sure you're on the student view, not CR view

### Issue: Can't approve/reject (CR)
**Solution:** Make sure you're logged in as CR with valid token

---

## 🎉 Success Indicators

✅ Student sees "Apply for Leave" button  
✅ Modal opens when button clicked  
✅ Form validation works  
✅ Leave request appears in table after submit  
✅ CR sees all requests  
✅ Approve/Reject buttons work  
✅ Status updates immediately  
✅ Colors match status (yellow/green/red)  

---

## 🔧 Technical Details

**Backend:** http://localhost:5000  
**API Endpoint:** /api/leaves  
**Database:** MongoDB (LeaveRequest collection)  
**Authentication:** RegNo + DOB for students, JWT for CR  

---

## 📞 Need Help?

1. Check if backend is running (should see "Server is running on port 5000")
2. Check MongoDB connection (should see "MongoDB connected successfully")
3. Check browser console for errors (F12 → Console)
4. Verify your RegNo and DOB are correct

---

## ✅ Ready to Use!

The leave request system is **fully functional** and ready for use. Start by:

**Students:** Click "Apply for Leave" and submit your first request!  
**CR:** Check the Leaves page to see and manage requests!

🎯 **Everything works just like the announcements modal - clean, simple, and effective!**
