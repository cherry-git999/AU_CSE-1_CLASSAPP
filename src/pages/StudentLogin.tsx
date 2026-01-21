import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
// import api from '../api/axios'; // Uncomment when using real backend

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

    // Dummy credentials for testing (remove when backend is ready)
    const dummyStudents = [
      { regNo: '21BCS001', dob: '2003-05-15', name: 'John Doe', email: 'john@example.com' },
      { regNo: '21BCS002', dob: '2003-08-20', name: 'Jane Smith', email: 'jane@example.com' },
      { regNo: '21BCS003', dob: '2003-03-10', name: 'Mike Johnson', email: 'mike@example.com' },
    ];

    // Check dummy credentials
    const matchedStudent = dummyStudents.find(
      s => s.regNo.toLowerCase() === regNo.toLowerCase() && s.dob === dateOfBirth
    );

    if (matchedStudent) {
      // Dummy authentication success
      const dummyToken = 'dummy-student-jwt-token-' + Date.now();
      const studentData = {
        id: 'student-' + matchedStudent.regNo,
        name: matchedStudent.name,
        regNo: matchedStudent.regNo,
        email: matchedStudent.email,
        dateOfBirth: matchedStudent.dob
      };

      localStorage.setItem('studentToken', dummyToken);
      localStorage.setItem('student', JSON.stringify(studentData));
      localStorage.setItem('userType', 'student');

      setLoading(false);
      navigate('/student/dashboard');
      return;
    }

    // If not dummy, try real API (uncomment when backend is ready)
    /*
    try {
      const response = await api.post('/auth/student-login', { regNo, dateOfBirth });
      const { token, student } = response.data;

      localStorage.setItem('studentToken', token);
      localStorage.setItem('student', JSON.stringify(student));
      localStorage.setItem('userType', 'student');

      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
    */

    setError('Invalid credentials. Try: 21BCS001 / 2003-05-15');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gold mb-2">Student Login</h1>
          <p className="text-white/60">View-Only Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/80 mb-2 font-medium">Registration Number</label>
            <input
              type="text"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              placeholder="e.g., 21BCS001"
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
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
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

        <div className="mt-4 p-4 bg-gold/10 border border-gold/30 rounded-lg">
          <p className="text-gold text-sm font-semibold mb-2">🔑 Test Credentials:</p>
          <div className="space-y-1 text-xs text-white/70">
            <p>• Reg No: <span className="text-gold font-mono">21BCS001</span> | DOB: <span className="text-gold font-mono">2003-05-15</span></p>
            <p>• Reg No: <span className="text-gold font-mono">21BCS002</span> | DOB: <span className="text-gold font-mono">2003-08-20</span></p>
            <p>• Reg No: <span className="text-gold font-mono">21BCS003</span> | DOB: <span className="text-gold font-mono">2003-03-10</span></p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default StudentLogin;
