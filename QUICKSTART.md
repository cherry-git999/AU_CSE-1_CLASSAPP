# Quick Start Guide

## 🚀 Getting Started

### 1. Environment Setup
Copy the example environment file and configure your backend API URL:
```bash
cp .env.example .env
```

Edit `.env` and set:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

## 📋 Available Routes

### Public Routes
- `/` - Home page with login options
- `/admin/login` - CR/LR admin login
- `/attendance/lookup` - Student attendance lookup

### Protected Admin Routes (Requires JWT Token)
- `/admin/dashboard` - Admin dashboard overview
- `/admin/students` - Students list with search
- `/admin/attendance` - Attendance management
- `/admin/leaves` - Leave requests management
- `/admin/announcements` - Announcements management

## 🔐 Admin Login Test
Use your backend credentials or test with:
- Email: admin@example.com
- Password: (from your backend)

## 🎯 Features to Test

### Student Attendance Lookup
1. Go to `/attendance/lookup`
2. Enter Registration Number (e.g., 21BCS001)
3. Enter Date of Birth
4. View attendance records and status

### Admin Features
1. Login at `/admin/login`
2. Navigate through sidebar:
   - View dashboard statistics
   - Search and view students
   - Edit attendance records
   - Approve/Reject leave requests
   - Create announcements

## 🛠 Backend Integration Checklist

Make sure your backend implements these endpoints:

- [ ] POST `/auth/login` - Returns { token, user }
- [ ] POST `/attendance/lookup` - Returns student attendance
- [ ] GET `/students` - Returns all students
- [ ] GET `/attendance` - Returns all attendance records
- [ ] PUT `/attendance/update` - Updates attendance
- [ ] GET `/leaves` - Returns leave requests
- [ ] PUT `/leaves/:id` - Updates leave status
- [ ] GET `/announcements` - Returns announcements
- [ ] POST `/announcements` - Creates announcement

## 🎨 UI Features

- ✅ Dark theme with glassmorphism
- ✅ Gold accent color (#D4AF37)
- ✅ Mobile-responsive design
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Status badges (Eligible/Condonation/Detained)
- ✅ Inline editing for attendance
- ✅ Search functionality

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚨 Common Issues

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173
```

### API Connection Error
- Check `.env` file has correct `VITE_API_BASE_URL`
- Ensure backend server is running
- Check CORS settings on backend

### Build Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📞 Support

For issues or questions, contact the development team.
