# CSE 1 Official - Frontend

A modern, production-ready class management system for CSE Section 1 with attendance tracking, leave management, and announcements.

## 🚀 Features

### Public Access
- **Home Page**: Clean landing page with access options
- **Attendance Lookup**: Students can view their attendance using Registration Number and Date of Birth

### Admin Access (CR/LR)
- **Secure Login**: JWT-based authentication
- **Dashboard**: Overview of students, attendance, and pending tasks
- **Students Management**: View and search all students
- **Attendance Management**: Edit and track attendance records with real-time status calculation
- **Leave Requests**: Approve or reject student leave requests
- **Announcements**: Create and manage class announcements

## 🛠 Tech Stack

- **React** (Vite) - Fast build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React Router DOM** - Client-side routing
- **Plus Jakarta Sans** - Google Font

## 📁 Project Structure

```
src/
├── api/
│   └── axios.ts               # API configuration with interceptors
├── auth/
│   └── PrivateRoute.tsx       # Protected route wrapper
├── components/
│   ├── Sidebar.tsx            # Admin navigation sidebar
│   ├── Navbar.tsx             # Top navigation bar
│   └── GlassCard.tsx          # Reusable glass card component
├── pages/
│   ├── Home.tsx               # Landing page
│   ├── AdminLogin.tsx         # Admin authentication
│   ├── AdminDashboard.tsx     # Admin dashboard
│   ├── AttendanceLookup.tsx   # Student attendance lookup
│   ├── AttendanceManage.tsx   # Admin attendance management
│   ├── Students.tsx           # Students list
│   ├── Leaves.tsx             # Leave requests management
│   └── Announcements.tsx      # Announcements management
├── routes/
│   └── AppRoutes.tsx          # Application routing
├── styles/
│   └── globals.css            # Global styles and Tailwind
├── App.tsx                    # Root component
└── main.tsx                   # Application entry point
```

## 🎨 Design Features

- **Dark Theme**: Modern dark UI with glassmorphism effects
- **Gold Accent Color**: #D4AF37
- **Responsive**: Mobile-first design
- **Clean Forms**: Proper validation and error handling
- **Smooth Interactions**: Hover and focus states

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd classapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update `VITE_API_BASE_URL` with your backend API URL
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔌 Backend API Requirements

The frontend expects the following API endpoints:

### Authentication
- `POST /auth/login` - Admin login (email, password)

### Students
- `GET /students` - Get all students

### Attendance
- `POST /attendance/lookup` - Student attendance lookup (regNo, dateOfBirth)
- `GET /attendance` - Get all attendance records (Admin)
- `PUT /attendance/update` - Update attendance (Admin)

### Leave Requests
- `GET /leaves` - Get all leave requests (Admin)
- `PUT /leaves/:id` - Update leave status (Admin)

### Announcements
- `GET /announcements` - Get all announcements
- `POST /announcements` - Create announcement (Admin)

## 🔐 Authentication Flow

1. Admin logs in with email and password
2. JWT token is stored in `localStorage`
3. Token is automatically added to all API requests via Axios interceptor
4. On 401 response, user is logged out and redirected to login
5. Protected routes check for token before rendering

## 📱 Responsive Design

- **Desktop**: Full sidebar navigation
- **Tablet**: Optimized layouts
- **Mobile**: Touch-friendly interface with proper spacing

## 🎯 Status Calculation Logic

Attendance status is automatically calculated:
- **Eligible**: ≥75% attendance
- **Condonation**: 65-74% attendance
- **Detained**: <65% attendance

## 🚫 What's NOT Included (As Per Requirements)

- Firebase integration
- Payment systems
- Chat features
- GPS tracking
- AI assistants
- Dummy data
- Placeholder content

## 📝 Development Notes

- All components are functional and API-ready
- Form validation is implemented
- Error handling is in place
- Mobile-responsive tables
- Clean code structure for easy maintenance

## 🤝 Contributing

This is a class project. For any issues or improvements, please contact the development team.

## 📄 License

This project is for educational purposes only.
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
