import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MobileMenu from '../components/MobileMenu';

const StudentDashboard = () => {
  const student = JSON.parse(localStorage.getItem('student') || '{}');

  const stats = [
    { label: 'Your Attendance', value: '82%', icon: '📊' },
    { label: 'Total Students', value: '60', icon: '👥' },
    { label: 'Your Leaves', value: '3', icon: '📋' },
    { label: 'Announcements', value: '12', icon: '📢' },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <MobileMenu />
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Read-Only Banner */}
          <div className="mb-6 bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-xl">👁️</span>
              <div>
                <p className="font-semibold">Read-Only Student View</p>
                <p className="text-sm text-blue-300/80">Welcome, {student.name || 'Student'}! You can view all information but cannot edit.</p>
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gold mb-8">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {stats.map((stat, index) => (
              <GlassCard key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className="text-3xl md:text-4xl">{stat.icon}</div>
                </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="p-6">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Quick Access</h2>
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
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
