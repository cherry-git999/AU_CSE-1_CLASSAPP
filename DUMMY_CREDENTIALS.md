# 🔑 Dummy Test Credentials

## Quick Access Credentials for Testing

### 👨‍🎓 Student Login
**Route:** `/student/login`

| Reg No | Date of Birth | Name | Email |
|--------|---------------|------|-------|
| `21BCS001` | `2003-05-15` | John Doe | john@example.com |
| `21BCS002` | `2003-08-20` | Jane Smith | jane@example.com |
| `21BCS003` | `2003-03-10` | Mike Johnson | mike@example.com |

**Access Level:** View-Only (All Modules)

---

### 🔐 Admin Login  
**Route:** `/admin/login`

| Email | Password | Name | Role |
|-------|----------|------|------|
| `admin@cse1.com` | `admin123` | Admin User | CR |
| `cr@cse1.com` | `cr123` | Class Representative | CR |
| `lr@cse1.com` | `lr123` | Lab Representative | LR |

**Access Level:** Full Control (Edit, Create, Delete)

---

## 🧪 Testing Instructions

### Test Student Access (Read-Only)
1. Go to: http://localhost:5173
2. Click "Login as Student"
3. Enter:
   - **Reg No:** `21BCS001`
   - **DOB:** `2003-05-15`
4. Navigate through all pages
5. Verify no edit buttons visible

### Test Admin Access (Full Control)
1. Go to: http://localhost:5173
2. Click "CR / LR Login"
3. Enter:
   - **Email:** `admin@cse1.com`
   - **Password:** `admin123`
4. Test all CRUD operations
5. Verify all edit buttons work

---

## 📝 Notes

- Credentials are shown on login pages
- Data is stored in localStorage
- Tokens are dummy (prefix: `dummy-`)
- Backend API calls are commented out
- Easy to switch to real API later

---

## 🔄 Switching to Real Backend

When your backend is ready:

1. Open `src/pages/AdminLogin.tsx`
2. Uncomment the API call block
3. Comment out/remove dummy credentials section

4. Open `src/pages/StudentLogin.tsx`
5. Uncomment the API call block
6. Comment out/remove dummy credentials section

The commented code is already there - just swap!

---

*Last Updated: January 21, 2026*
