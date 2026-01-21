import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gold mb-4">
            CSE 1 Official
          </h1>
          <p className="text-xl text-white/70">
            Computer Science & Engineering - Section 1
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard className="p-8 text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-white mb-3">CR / LR Login</h2>
            <p className="text-white/60 mb-6">
              Access admin dashboard to manage attendance, leaves, and announcements
            </p>
            <Link
              to="/admin/login"
              className="btn-primary inline-block w-full"
            >
              Login as Admin
            </Link>
          </GlassCard>

          <GlassCard className="p-8 text-center">
            <div className="text-4xl mb-4">�‍🎓</div>
            <h2 className="text-2xl font-bold text-white mb-3">Student Login</h2>
            <p className="text-white/60 mb-6">
              View-only access to attendance, announcements, leaves, and student list
            </p>
            <Link
              to="/student/login"
              className="btn-secondary inline-block w-full"
            >
              Login as Student
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Home;
