import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const student = localStorage.getItem('student');
  const userType = localStorage.getItem('userType');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('student');
    localStorage.removeItem('userType');
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const showBackButton = location.pathname !== '/' && location.pathname !== '/admin/dashboard' && location.pathname !== '/student/dashboard';

  return (
    <nav className="bg-gradient-to-r from-black/60 via-primary-900/40 to-black/60 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="md:hidden text-white/70 hover:text-primary-400 transition-colors"
              title="Go back"
            >
              ← Back
            </button>
          )}
          <Link to="/" className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            CSE 1 Official
          </Link>
        </div>
        
        {(token || student) && (
          <div className="flex items-center gap-4">
            {userType === 'student' && (
              <span className="hidden md:flex items-center gap-2 text-sm bg-blue-500/20 text-blue-300 font-medium px-3 py-1.5 rounded-full border border-blue-500/30">
                <span>👁️</span> View Mode
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-white/70 hover:text-primary-400 transition-colors text-sm md:text-base font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
