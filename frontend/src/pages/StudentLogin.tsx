import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import api from '../api/axios';

const StudentLogin = () => {
  const [regNo, setRegNo] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regNo || !dateOfBirth) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      console.log('Sending request:', { regNo: regNo.trim(), dob: dateOfBirth });
      
      // Call the attendance lookup API (no JWT token returned)
      const response = await api.post('/attendance/lookup', { 
        regNo: regNo.trim(), 
        dob: dateOfBirth // Already in YYYY-MM-DD format from date input
      });
      
      console.log('Response received:', response.data);
      
      const { name, regNo: studentRegNo, attendance } = response.data;

      // Store student info (no token for students - just lookup data)
      const studentData = { 
        name, 
        regNo: studentRegNo, 
        attendance 
      };
      
      console.log('Storing student data:', studentData);
      localStorage.setItem('student', JSON.stringify(studentData));
      localStorage.setItem('userType', 'student');
      
      console.log('Navigating to dashboard...');
      navigate('/student/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent"></div>
      
      <GlassCard className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl mb-4">
            <span className="text-4xl">👨‍🎓</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">Student Login</h1>
          <p className="text-white/60">View-Only Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/80 mb-2 font-medium">Registration Number</label>
            <input
              type="text"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              placeholder="CSE002"
              className="w-full"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-white/80 mb-2 font-medium">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
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

        <p className="text-white/50 text-sm text-center mt-6">
          Students have view-only access to all modules
        </p>
      </GlassCard>
    </div>
  );
};

export default StudentLogin;
