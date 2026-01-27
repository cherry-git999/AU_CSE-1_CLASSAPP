import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const userType = localStorage.getItem('userType');
  const isStudent = userType === 'student';

  const baseMenuItems = [
    { name: 'Dashboard', path: isStudent ? '/student/dashboard' : '/admin/dashboard', icon: '📊' },
    // Only show the Students list to non-student users
    ...(!isStudent ? [{ name: 'Students', path: '/admin/students', icon: '👥' }] : []),
    { name: isStudent ? 'Attendance' : 'Mark Attendance', path: isStudent ? '/student/attendance' : '/admin/attendance', icon: '📝' },
    ...(!isStudent ? [{ name: 'View All Attendance', path: '/admin/attendance/view', icon: '📋' }] : []),
    { name: 'Leave Requests', path: isStudent ? '/student/leaves' : '/admin/leaves', icon: '📄' },
    { name: 'Announcements', path: isStudent ? '/student/announcements' : '/admin/announcements', icon: '📢' },
  ];

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-black/40 via-primary-900/20 to-black/40 backdrop-blur-xl border-r border-white/10 p-6 hidden md:block shadow-2xl">
      {isStudent && (
        <div className="mb-6 p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-xl backdrop-blur-sm">
          <p className="text-xs text-blue-300 font-semibold flex items-center gap-2">
            <span>👁️</span> VIEW-ONLY MODE
          </p>
        </div>
      )}
      <div className="space-y-2">
        {baseMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
              location.pathname === item.path
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg shadow-primary-500/50 scale-105'
                : 'text-white/70 hover:bg-white/5 hover:text-primary-400 hover:scale-102'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
