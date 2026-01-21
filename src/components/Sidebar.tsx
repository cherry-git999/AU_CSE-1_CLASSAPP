import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const userType = localStorage.getItem('userType');
  const isStudent = userType === 'student';

  const baseMenuItems = [
    { name: 'Dashboard', path: isStudent ? '/student/dashboard' : '/admin/dashboard', icon: '📊' },
    { name: 'Students', path: isStudent ? '/student/students' : '/admin/students', icon: '👥' },
    { name: 'Attendance', path: isStudent ? '/student/attendance' : '/admin/attendance', icon: '📝' },
    { name: 'Leave Requests', path: isStudent ? '/student/leaves' : '/admin/leaves', icon: '📋' },
    { name: 'Announcements', path: isStudent ? '/student/announcements' : '/admin/announcements', icon: '📢' },
  ];

  return (
    <aside className="w-64 min-h-screen bg-black/30 backdrop-blur-lg border-r border-white/10 p-6 hidden md:block">
      {isStudent && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg">
          <p className="text-xs text-blue-400 font-semibold">👁️ VIEW-ONLY MODE</p>
        </div>
      )}
      <div className="space-y-2">
        {baseMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              location.pathname === item.path
                ? 'bg-gold text-black font-semibold'
                : 'text-white/70 hover:bg-white/5 hover:text-gold'
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
