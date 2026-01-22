import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MobileMenu from '../components/MobileMenu';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Students', value: '60', icon: '👥', gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Average Attendance', value: '82%', icon: '📊', gradient: 'from-green-500 to-emerald-500' },
    { label: 'Pending Leaves', value: '5', icon: '📋', gradient: 'from-orange-500 to-amber-500' },
    { label: 'Announcements', value: '12', icon: '📢', gradient: 'from-purple-500 to-pink-500' },
  ];

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

          <GlassCard className="p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Quick Actions</h2>
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
