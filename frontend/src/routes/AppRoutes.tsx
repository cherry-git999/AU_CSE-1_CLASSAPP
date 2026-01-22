import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../auth/PrivateRoute';
import StudentPrivateRoute from '../auth/StudentPrivateRoute';
import Navbar from '../components/Navbar';
import Home from '../pages/Home';
import AdminLogin from '../pages/AdminLogin';
import StudentLogin from '../pages/StudentLogin';
import AdminDashboard from '../pages/AdminDashboard';
import StudentDashboard from '../pages/StudentDashboard';
import AttendanceLookup from '../pages/AttendanceLookup';
import AttendanceManage from '../pages/AttendanceManage';
import Students from '../pages/Students';
import Leaves from '../pages/Leaves';
import Announcements from '../pages/Announcements';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/admin/login" element={<><Navbar /><AdminLogin /></>} />
        <Route path="/student/login" element={<><Navbar /><StudentLogin /></>} />
        <Route path="/attendance/lookup" element={<><Navbar /><AttendanceLookup /></>} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <Navbar />
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <PrivateRoute>
              <Navbar />
              <Students />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <PrivateRoute>
              <Navbar />
              <AttendanceManage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/leaves"
          element={
            <PrivateRoute>
              <Navbar />
              <Leaves />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <PrivateRoute>
              <Navbar />
              <Announcements />
            </PrivateRoute>
          }
        />

        {/* Protected Student Routes (Read-Only) */}
        <Route
          path="/student/dashboard"
          element={
            <StudentPrivateRoute>
              <Navbar />
              <StudentDashboard />
            </StudentPrivateRoute>
          }
        />
        <Route
          path="/student/students"
          element={
            <StudentPrivateRoute>
              <Navbar />
              <Students />
            </StudentPrivateRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <StudentPrivateRoute>
              <Navbar />
              <AttendanceManage />
            </StudentPrivateRoute>
          }
        />
        <Route
          path="/student/leaves"
          element={
            <StudentPrivateRoute>
              <Navbar />
              <Leaves />
            </StudentPrivateRoute>
          }
        />
        <Route
          path="/student/announcements"
          element={
            <StudentPrivateRoute>
              <Navbar />
              <Announcements />
            </StudentPrivateRoute>
          }
        />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
