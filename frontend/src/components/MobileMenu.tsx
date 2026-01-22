import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const userType = localStorage.getItem('userType');
  const isStudent = userType === 'student';

  const baseMenuItems = [
    { name: 'Dashboard', path: isStudent ? '/student/dashboard' : '/admin/dashboard', icon: '📊' },
    { name: 'Students', path: isStudent ? '/student/students' : '/admin/students', icon: '👥' },
    { name: isStudent ? 'Attendance' : 'Mark Attendance', path: isStudent ? '/student/attendance' : '/admin/attendance', icon: '📝' },
    ...(!isStudent ? [{ name: 'View All Attendance', path: '/admin/attendance/view', icon: '📋' }] : []),
    { name: 'Leave Requests', path: isStudent ? '/student/leaves' : '/admin/leaves', icon: '📄' },
    { name: 'Announcements', path: isStudent ? '/student/announcements' : '/admin/announcements', icon: '📢' },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gold text-black p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-24 right-6 z-50 bg-black/90 backdrop-blur-lg border border-white/10 rounded-lg p-4 w-64">
            {isStudent && (
              <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/50 rounded">
                <p className="text-xs text-blue-400 font-semibold">👁️ VIEW-ONLY MODE</p>
              </div>
            )}
            <div className="space-y-2">
              {baseMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
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
          </div>
        </>
      )}
    </div>
  );
};

export default MobileMenu;
