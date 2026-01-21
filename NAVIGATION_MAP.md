# 🗺️ Application Routes & Navigation Map

## Public Routes (No Authentication Required)

### 1. Home Page
```
Route: /
Component: Home.tsx
Purpose: Landing page with two main options
```

**Features:**
- CSE 1 Official branding
- Two glass cards:
  - 🔐 CR/LR Login → Redirects to `/admin/login`
  - 📊 Check Attendance → Redirects to `/attendance/lookup`

**Navigation:**
```
Home (/)
├── Admin Login (/admin/login)
└── Attendance Lookup (/attendance/lookup)
```

---

### 2. Admin Login
```
Route: /admin/login
Component: AdminLogin.tsx
Purpose: CR/LR authentication
Protected: No (Public)
```

**Form Fields:**
- Email (text input)
- Password (password input)
- Login button

**Flow:**
```
/admin/login
    ↓ (Success)
/admin/dashboard (with JWT token)
    ↓ (Failure)
Error message displayed
```

---

### 3. Attendance Lookup
```
Route: /attendance/lookup
Component: AttendanceLookup.tsx
Purpose: Students view their attendance
Protected: No (Public)
```

**Form Fields:**
- Registration Number (text input)
- Date of Birth (date input)
- View Attendance button

**Response Display:**
- Student name & reg no
- Overall attendance percentage
- Status badge (Eligible/Condonation/Detained)
- Subject-wise table:
  - Subject name
  - Attended classes
  - Total classes
  - Percentage

---

## Protected Admin Routes (JWT Required)

### 4. Admin Dashboard
```
Route: /admin/dashboard
Component: AdminDashboard.tsx
Layout: Navbar + Sidebar + Content
Protected: Yes ✓
```

**Features:**
- Statistics cards:
  - Total Students (👥)
  - Average Attendance (📊)
  - Pending Leaves (📋)
  - Announcements (📢)
- Quick action buttons:
  - Manage Attendance
  - Review Leaves
  - Create Announcement

**Navigation from Sidebar:**
```
Dashboard (current)
Students
Attendance
Leave Requests
Announcements
```

---

### 5. Students Management
```
Route: /admin/students
Component: Students.tsx
Layout: Navbar + Sidebar + Content
Protected: Yes ✓
```

**Features:**
- Search bar (by name or reg no)
- Students table:
  - Registration No
  - Name
  - Email
  - Date of Birth
- Read-only view

---

### 6. Attendance Management
```
Route: /admin/attendance
Component: AttendanceManage.tsx
Layout: Navbar + Sidebar + Content
Protected: Yes ✓
```

**Features:**
- Attendance table with columns:
  - Student Name
  - Reg No
  - Subject
  - Attended (editable)
  - Total (editable)
  - Percentage (calculated)
  - Status (calculated)
  - Actions (Edit/Save/Cancel)
- Inline editing
- Real-time calculation
- API update on save

**Edit Flow:**
```
Click Edit
    ↓
Attended & Total become input fields
    ↓
Modify values
    ↓
Click Save → API call → Update display
    OR
Click Cancel → Revert changes
```

---

### 7. Leave Requests
```
Route: /admin/leaves
Component: Leaves.tsx
Layout: Navbar + Sidebar + Content
Protected: Yes ✓
```

**Features:**
- Leave requests table:
  - Student Name
  - Reg No
  - Start Date
  - End Date
  - Reason
  - Status (Pending/Approved/Rejected)
  - Actions (Approve/Reject buttons)
- Action buttons only visible for Pending status
- API update on approval/rejection

**Action Flow:**
```
Pending Leave
    ↓
Click Approve → API call → Status: Approved
    OR
Click Reject → API call → Status: Rejected
```

---

### 8. Announcements
```
Route: /admin/announcements
Component: Announcements.tsx
Layout: Navbar + Sidebar + Content
Protected: Yes ✓
```

**Features:**

**Create Announcement Form:**
- Title input
- Content textarea
- Create button

**Announcements List:**
- Title (bold)
- Content
- Created date
- Created by (admin name)

**Flow:**
```
Fill form
    ↓
Click Create Announcement
    ↓
API call
    ↓
Success → Announcement added to list
Error → Error message displayed
```

---

## Navigation Components

### Navbar (Appears on all pages)
```
Position: Top
Content:
├── CSE 1 Official (logo/brand)
└── Logout button (if authenticated)
```

**Behavior:**
- Always visible
- Shows logout only when JWT exists
- Clicking logo redirects to home
- Logout clears token & redirects to login

---

### Sidebar (Admin pages only)
```
Position: Left
Layout: Vertical menu
Items:
1. 📊 Dashboard → /admin/dashboard
2. 👥 Students → /admin/students
3. 📝 Attendance → /admin/attendance
4. 📋 Leave Requests → /admin/leaves
5. 📢 Announcements → /admin/announcements
```

**Behavior:**
- Active route highlighted in gold
- Hover effects on inactive items
- Icons for visual clarity

---

## Route Protection Flow

```
User navigates to /admin/*
    ↓
PrivateRoute checks localStorage for token
    ↓
    Token exists?
    ├── Yes → Render requested page
    └── No → Redirect to /admin/login
```

**Auto-logout on 401:**
```
API call returns 401
    ↓
Axios interceptor catches it
    ↓
Clear token & user from localStorage
    ↓
Redirect to /admin/login
```

---

## Complete Navigation Map

```
┌─────────────────────────────────────────────┐
│              Home (/)                       │
│  ┌────────────────┐  ┌──────────────────┐  │
│  │ CR/LR Login    │  │ Check Attendance │  │
│  └────────┬───────┘  └────────┬─────────┘  │
└───────────┼──────────────────┼─────────────┘
            │                  │
            ▼                  ▼
    /admin/login      /attendance/lookup
            │
         (Auth)
            │
            ▼
    ┌──────────────────────────────┐
    │    Admin Dashboard           │
    │    /admin/dashboard          │
    │                              │
    │  ┌──────── Sidebar ────────┐│
    │  │ • Dashboard             ││
    │  │ • Students    ──────────┼┼──→ /admin/students
    │  │ • Attendance  ──────────┼┼──→ /admin/attendance
    │  │ • Leaves      ──────────┼┼──→ /admin/leaves
    │  │ • Announcements ────────┼┼──→ /admin/announcements
    │  └─────────────────────────┘│
    └──────────────────────────────┘
```

---

## URL Parameters & Query Strings

Currently, the app doesn't use URL parameters. All data is fetched via API calls.

**Future Enhancement Ideas:**
- `/admin/students/:id` - Individual student details
- `/attendance/lookup?regNo=21BCS001` - Pre-filled search
- `/admin/leaves?status=pending` - Filtered view

---

## Error Routes

```
Unknown route (e.g., /xyz)
    ↓
Redirect to / (Home page)
```

Handled by: `<Route path="*" element={<Navigate to="/" replace />} />`

---

## Testing Navigation

### Student Flow
```
1. Visit http://localhost:5173
2. Click "Check Attendance"
3. Enter credentials
4. View attendance
5. Click logo to go back home
```

### Admin Flow
```
1. Visit http://localhost:5173
2. Click "CR / LR Login"
3. Enter email & password
4. Navigate through sidebar:
   - Dashboard
   - Students (search functionality)
   - Attendance (edit records)
   - Leaves (approve/reject)
   - Announcements (create new)
5. Click Logout
```

---

## Route Security Summary

| Route | Protected | Auth Check | On Fail |
|-------|-----------|------------|---------|
| `/` | No | None | N/A |
| `/admin/login` | No | None | N/A |
| `/attendance/lookup` | No | None | N/A |
| `/admin/dashboard` | Yes | JWT in localStorage | Redirect to login |
| `/admin/students` | Yes | JWT in localStorage | Redirect to login |
| `/admin/attendance` | Yes | JWT in localStorage | Redirect to login |
| `/admin/leaves` | Yes | JWT in localStorage | Redirect to login |
| `/admin/announcements` | Yes | JWT in localStorage | Redirect to login |

---

*Complete navigation structure for CSE 1 Official Frontend*
