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

interface AttendanceRecord {
  subject: string;
  attended: number;
  total: number;
  percentage: number;
  status: string;
}

const StudentDashboard = () => {
  const student = JSON.parse(localStorage.getItem('student') || '{}');
  const [stats, setStats] = useState([
    { label: 'Your Attendance', value: '...', icon: '📊', gradient: 'from-green-500 to-emerald-500' },
    { label: 'Total Students', value: '...', icon: '👥', gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Your Leaves', value: '...', icon: '📋', gradient: 'from-orange-500 to-amber-500' },
    { label: 'Announcements', value: '...', icon: '📢', gradient: 'from-purple-500 to-pink-500' },
  ]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [subjectAttendance, setSubjectAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch student's data from localStorage
      const studentData = JSON.parse(localStorage.getItem('student') || '{}');
      let overallAttendance = 0;
      let hasAttendanceData = false;
      let totalLeaves = 0;
      let attendanceData: AttendanceRecord[] = [];

      console.log('Fetching dashboard data for:', studentData.regNo);

      // Fetch real-time attendance data from database via API
      if (studentData.regNo && studentData.dob) {
        try {
          console.log('Fetching attendance from database...');
          const attendanceResponse = await api.post('/attendance/lookup', {
            regNo: studentData.regNo,
            dob: studentData.dob
          });

          console.log('Full Attendance API response:', JSON.stringify(attendanceResponse.data, null, 2));
          console.log('Attendance API response:', attendanceResponse.data);
          console.log('Attendance field:', attendanceResponse.data.attendance);
          console.log('Attendance array:', attendanceResponse.data.attendance);
          console.log('Is array?', Array.isArray(attendanceResponse.data.attendance));

          // The API might return attendance in different fields
          const attendanceArray = attendanceResponse.data.attendance || 
                                  attendanceResponse.data.overallAttendance || 
                                  [];
          
          console.log('Using attendance array:', attendanceArray);

          if (attendanceArray && Array.isArray(attendanceArray)) {
            attendanceData = attendanceArray;
            console.log('Attendance data length:', attendanceData.length);
            
            // If attendance array has records (even if empty), we have data
            if (attendanceData.length > 0) {
              hasAttendanceData = true;
              
              // Calculate overall attendance percentage from all subjects in DB
              // This aggregates attended/total across all subjects to get overall %
              let totalAttended = 0;
              let totalClasses = 0;
              
              attendanceData.forEach((record: any) => {
                console.log('Processing record:', record);
                totalAttended += record.attended || 0;
                totalClasses += record.total || 0;
              });

              console.log('Total calculation:', { totalAttended, totalClasses });

              if (totalClasses > 0) {
                overallAttendance = Math.round((totalAttended / totalClasses) * 100);
                console.log('Calculated attendance=' + overallAttendance + '%');
              } else {
                // Has records but no classes conducted yet
                overallAttendance = 0;
                console.log('Has attendance records but totalClasses=0, showing 0%');
              }

              console.log('Overall attendance from DB:', `${totalAttended}/${totalClasses} = ${overallAttendance}%`);

              // Set subject-wise attendance with dynamic data from DB
              setSubjectAttendance(attendanceData);
            } else {
              console.log('Attendance array is empty - no records found in database for this student');
            }
          } else {
            console.log('No attendance data in response or not an array');
          }
        } catch (attendanceError: any) {
          console.error('Error fetching attendance:', attendanceError);
          console.error('Error details:', attendanceError.response?.data);
          // Fallback to localStorage data if API call fails
          if (studentData.attendance && Array.isArray(studentData.attendance)) {
            console.log('Using fallback localStorage data');
            attendanceData = studentData.attendance;
            
            let totalAttended = 0;
            let totalClasses = 0;
            
            attendanceData.forEach((record: any) => {
              totalAttended += record.attended || 0;
              totalClasses += record.total || 0;
            });

            if (totalClasses > 0) {
              hasAttendanceData = true;
              overallAttendance = Math.round((totalAttended / totalClasses) * 100);
            }

            setSubjectAttendance(attendanceData);
          }
        }

        // Fetch student's actual leave requests from database via API
        // This shows the count of leave applications submitted by the student
        try {
          console.log('Fetching leave requests from database...');
          const leavesResponse = await api.get('/leaves', {
            params: {
              regNo: studentData.regNo,
              dob: studentData.dob
            }
          });

          console.log('Leave requests from DB:', leavesResponse.data);
          totalLeaves = leavesResponse.data.count || 0;
        } catch (leavesError: any) {
          console.error('Error fetching leaves:', leavesError);
          console.error('Error details:', leavesError.response?.data);
          // Fallback to 0 if API call fails
          totalLeaves = 0;
        }
      }

      // Fetch announcements dynamically
      try {
        console.log('Fetching announcements from API...');
        const announcementsResponse = await api.get('/announcements');
        console.log('Announcements API response:', announcementsResponse.data);
        
        const allAnnouncements = announcementsResponse.data.announcements || [];
        const announcementsCount = allAnnouncements.length || 0;
        
        // Get recent 3 announcements
        setRecentAnnouncements(allAnnouncements.slice(0, 3));

        // Fetch total students count (public endpoint)
        let totalStudents = 'N/A';
        try {
          const studentsResponse = await api.get('/students/count');
          totalStudents = studentsResponse.data.count?.toString() || 'N/A';
        } catch (err) {
          console.error('Error fetching student count:', err);
          totalStudents = 'N/A';
        }

        console.log('Updating stats with:', { overallAttendance, hasAttendanceData, totalStudents, totalLeaves, announcementsCount });

        // Update stats with real data
        setStats([
          // COMMENTED OUT - Attendance percentage not working dynamically
          // { 
          //   label: 'Your Attendance', 
          //   value: hasAttendanceData ? `${overallAttendance}%` : 'N/A', 
          //   icon: '📊', 
          //   gradient: overallAttendance >= 75 ? 'from-green-500 to-emerald-500' : 
          //            overallAttendance >= 65 ? 'from-orange-500 to-amber-500' : 
          //            'from-red-500 to-pink-500' 
          // },
          { 
            label: 'Total Students', 
            value: totalStudents, 
            icon: '👥', 
            gradient: 'from-blue-500 to-cyan-500' 
          },
          { 
            label: 'Your Leaves', 
            value: totalLeaves.toString(), 
            icon: '📋', 
            gradient: 'from-orange-500 to-amber-500' 
          },
          { 
            label: 'Announcements', 
            value: announcementsCount.toString(), 
            icon: '📢', 
            gradient: 'from-purple-500 to-pink-500' 
          },
        ]);
      } catch (announcementsError) {
        console.error('Error fetching announcements:', announcementsError);
      }

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
          {/* Read-Only Banner */}
          <div className="mb-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/30 text-blue-300 px-6 py-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👁️</span>
              <div>
                <p className="font-semibold text-lg">Read-Only Student View</p>
                <p className="text-sm text-blue-200/80">Welcome, {student.name || 'Student'}! You can view all information but cannot edit.</p>
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-8">Dashboard</h1>

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
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/student/attendance"
                className="btn-secondary text-center"
              >
                View Attendance
              </a>
              <a
                href="/student/leaves"
                className="btn-secondary text-center"
              >
                View Leaves
              </a>
              <a
                href="/student/announcements"
                className="btn-secondary text-center"
              >
                View Announcements
              </a>
            </div>
          </GlassCard>

          {/* Subject-wise Attendance */}
          {subjectAttendance.length > 0 && (
            <GlassCard className="p-6 md:p-8 mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Subject-wise Attendance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectAttendance.map((record, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-2">{record.subject}</h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/60 text-sm">Attended</span>
                      <span className="text-white font-medium">{record.attended} / {record.total}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/60 text-sm">Percentage</span>
                      <span className={`font-bold ${
                        record.percentage >= 75 ? 'text-green-400' : 
                        record.percentage >= 65 ? 'text-orange-400' : 
                        'text-red-400'
                      }`}>
                        {record.percentage}%
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === 'Eligible' ? 'bg-green-500/20 text-green-400' :
                        record.status === 'Condonation' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {record.status}
                      </span>
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
                <a href="/student/announcements" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
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

export default StudentDashboard;
