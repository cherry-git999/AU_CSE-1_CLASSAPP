import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MobileMenu from '../components/MobileMenu';
import api from '../api/axios';

interface Announcement {
  title: string;
  message: string;
  createdAt: string;
}

interface StudentAttendance {
  _id: string;
  name: string;
  regNo: string;
  attendance: {
    subject: string;
    attended: number;
    total: number;
    percentage: number;
    status: string;
  }[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Students', value: '...', icon: '👥', gradient: 'from-blue-500 to-cyan-500' },
    // { label: 'Average Attendance', value: '...', icon: '📊', gradient: 'from-green-500 to-emerald-500' },
    // { label: 'Low Attendance', value: '...', icon: '⚠️', gradient: 'from-orange-500 to-amber-500' },
    { label: 'Announcements', value: '...', icon: '📢', gradient: 'from-purple-500 to-pink-500' },
  ]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState<StudentAttendance[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total students count
      const studentsResponse = await api.get('/students/count');
      const totalStudents = studentsResponse.data.count || 0;

      // Fetch all attendance data
      const attendanceResponse = await api.get('/attendance/all');
      const allStudentsData: StudentAttendance[] = attendanceResponse.data.students || [];

      // Calculate average attendance and find low attendance students
      let totalAttendanceSum = 0;
      let studentsWithAttendance = 0;
      const lowAttendance: StudentAttendance[] = [];

      allStudentsData.forEach((student) => {
        if (student.attendance && student.attendance.length > 0) {
          let studentTotalAttended = 0;
          let studentTotalClasses = 0;
          let hasLowAttendance = false;

          student.attendance.forEach((record) => {
            studentTotalAttended += record.attended || 0;
            studentTotalClasses += record.total || 0;
            
            // Check if any subject has low attendance
            if (record.percentage < 75) {
              hasLowAttendance = true;
            }
          });

          if (studentTotalClasses > 0) {
            const studentAvg = (studentTotalAttended / studentTotalClasses) * 100;
            totalAttendanceSum += studentAvg;
            studentsWithAttendance++;

            if (hasLowAttendance) {
              lowAttendance.push(student);
            }
          }
        }
      });

      // Fetch announcements
      const announcementsResponse = await api.get('/announcements');
      const allAnnouncements = announcementsResponse.data.announcements || [];
      const announcementsCount = allAnnouncements.length || 0;
      
      // Get recent 3 announcements
      setRecentAnnouncements(allAnnouncements.slice(0, 3));

      // Get top 5 low attendance students
      setLowAttendanceStudents(lowAttendance.slice(0, 5));

      // Update stats with real data
      setStats([
        { 
          label: 'Total Students', 
          value: totalStudents.toString(), 
          icon: '👥', 
          gradient: 'from-blue-500 to-cyan-500' 
        },
        // COMMENTED OUT - Average Attendance not working dynamically
        // { 
        //   label: 'Average Attendance', 
        //   value: `${avgAttendance}%`, 
        //   icon: '📊', 
        //   gradient: avgAttendance >= 75 ? 'from-green-500 to-emerald-500' : 
        //            avgAttendance >= 65 ? 'from-orange-500 to-amber-500' : 
        //            'from-red-500 to-pink-500' 
        // },
        // COMMENTED OUT - Low Attendance count not working dynamically
        // { 
        //   label: 'Low Attendance', 
        //   value: lowAttendance.length.toString(), 
        //   icon: '⚠️', 
        //   gradient: 'from-orange-500 to-amber-500' 
        // },
        { 
          label: 'Announcements', 
          value: announcementsCount.toString(), 
          icon: '📢', 
          gradient: 'from-purple-500 to-pink-500' 
        },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <MobileMenu />
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-8">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {stats.map((stat, index) => (
              <GlassCard key={index} className="p-6 group hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                    <p className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
                  </div>
                  <div className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">{stat.icon}</div>
                </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="p-6 md:p-8 mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/admin/attendance"
                className="btn-secondary text-center"
              >
                Mark Attendance
              </a>
              <a
                href="/admin/attendance/view"
                className="btn-secondary text-center"
              >
                View All Attendance
              </a>
              <a
                href="/admin/announcements"
                className="btn-secondary text-center"
              >
                Create Announcement
              </a>
            </div>
          </GlassCard>

          {/* Low Attendance Students */}
          {lowAttendanceStudents.length > 0 && (
            <GlassCard className="p-6 md:p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-white">Students with Low Attendance</h2>
                <a href="/admin/attendance/view" className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                  View All →
                </a>
              </div>
              <div className="space-y-3">
                {lowAttendanceStudents.map((student, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-orange-500/30">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{student.name}</h3>
                        <p className="text-sm text-white/60">{student.regNo}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {student.attendance.filter(a => a.percentage < 75).slice(0, 3).map((att, idx) => (
                        <span key={idx} className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          att.percentage >= 65 ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {att.subject}: {att.percentage}%
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Recent Announcements */}
          {recentAnnouncements.length > 0 && (
            <GlassCard className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-white">Recent Announcements</h2>
                <a href="/admin/announcements" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                  View All →
                </a>
              </div>
              <div className="space-y-4">
                {recentAnnouncements.map((announcement, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                      <span className="text-xs text-white/50">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm">{announcement.message}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
