import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const studentToken = localStorage.getItem('studentToken');
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
    <nav className="bg-black/50 backdrop-blur-lg border-b border-white/10 px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="md:hidden text-white/70 hover:text-gold transition-colors"
              title="Go back"
            >
              ← Back
            </button>
          )}
          <Link to="/" className="text-xl md:text-2xl font-bold text-gold">
            CSE 1 Official
          </Link>
        </div>
        
        {(token || studentToken) && (
          <div className="flex items-center gap-4">
            {userType === 'student' && (
              <span className="hidden md:block text-sm text-blue-400 font-medium">
                👁️ Read-Only Mode
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-white/70 hover:text-gold transition-colors text-sm md:text-base"
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
