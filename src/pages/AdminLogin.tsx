import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
// import api from '../api/axios'; // Uncomment when using real backend

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    // Dummy credentials for testing (remove when backend is ready)
    const dummyAdmins = [
      { email: 'admin@cse1.com', password: 'admin123', name: 'Admin User', role: 'CR' },
      { email: 'cr@cse1.com', password: 'cr123', name: 'Class Representative', role: 'CR' },
      { email: 'lr@cse1.com', password: 'lr123', name: 'Lab Representative', role: 'LR' },
    ];

    // Check dummy credentials
    const matchedAdmin = dummyAdmins.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    if (matchedAdmin) {
      // Dummy authentication success
      const dummyToken = 'dummy-admin-jwt-token-' + Date.now();
      const userData = {
        id: 'admin-' + matchedAdmin.role,
        name: matchedAdmin.name,
        email: matchedAdmin.email,
        role: matchedAdmin.role
      };

      localStorage.setItem('token', dummyToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.removeItem('userType'); // Admin doesn't set userType

      setLoading(false);
      navigate('/admin/dashboard');
      return;
    }

    // If not dummy, try real API (uncomment when backend is ready)
    /*
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
    */

    setError('Invalid credentials. Try: admin@cse1.com / admin123');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-primary-500/10 via-transparent to-transparent"></div>
      
      <GlassCard className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl mb-4">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">Admin Login</h1>
          <p className="text-white/60">CR / LR Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/80 mb-2 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-white/80 mb-2 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 rounded-xl backdrop-blur-sm">
          <p className="text-primary-300 text-sm font-semibold mb-2 flex items-center gap-2">
            <span>🔑</span> Test Credentials:
          </p>
          <div className="space-y-1 text-xs text-white/70">
            <p>• Email: <span className="text-primary-300 font-mono">admin@cse1.com</span> | Pass: <span className="text-primary-300 font-mono">admin123</span></p>
            <p>• Email: <span className="text-primary-300 font-mono">cr@cse1.com</span> | Pass: <span className="text-primary-300 font-mono">cr123</span></p>
            <p>• Email: <span className="text-primary-300 font-mono">lr@cse1.com</span> | Pass: <span className="text-primary-300 font-mono">lr123</span></p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default AdminLogin;
