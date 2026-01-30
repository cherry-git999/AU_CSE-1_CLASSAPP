import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 bg-clip-text text-transparent mb-4">
            CSE 1 Official
          </h1>
          <p className="text-xl md:text-2xl text-white/60">
            Computer Science & Engineering - Section 1
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard className="p-8 text-center group">
            <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">👨‍🎓</div>
            <h2 className="text-2xl font-bold text-white mb-3">Student Login</h2>
            <p className="text-white/60 mb-6 leading-relaxed">
              View-only access to attendance, announcements, leaves, and student list
            </p>
            <Link
              to="/student/login"
              className="btn-secondary inline-block w-full"
            >
              Login as Student
            </Link>
          </GlassCard>

          <GlassCard className="p-8 text-center group">
            <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">🔐</div>
            <h2 className="text-2xl font-bold text-white mb-3">CR / LR Login</h2>
            <p className="text-white/60 mb-6 leading-relaxed">
              Access admin dashboard to manage attendance, leaves, and announcements
            </p>
            <Link
              to="/admin/login"
              className="btn-primary inline-block w-full"
            >
              Login as Admin
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Home;
