import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MobileMenu from '../components/MobileMenu';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Students', value: '60', icon: '👥' },
    { label: 'Average Attendance', value: '82%', icon: '📊' },
    { label: 'Pending Leaves', value: '5', icon: '📋' },
    { label: 'Announcements', value: '12', icon: '📢' },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <MobileMenu />
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
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
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/admin/attendance"
                className="btn-secondary text-center"
              >
                Manage Attendance
              </a>
              <a
                href="/admin/leaves"
                className="btn-secondary text-center"
              >
                Review Leaves
              </a>
              <a
                href="/admin/announcements"
                className="btn-secondary text-center"
              >
                Create Announcement
              </a>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
