import { useState } from 'react';
import type { FormEvent } from 'react';
import GlassCard from '../components/GlassCard';
import api from '../api/axios';

interface AttendanceData {
  studentName: string;
  regNo: string;
  subjects: {
    name: string;
    attended: number;
    total: number;
    percentage: number;
  }[];
  overallPercentage: number;
  status: 'Eligible' | 'Condonation' | 'Detained';
}

const AttendanceLookup = () => {
  const [regNo, setRegNo] = useState('');
  const [dob, setDob] = useState('');
  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setAttendance(null);

    if (!regNo || !dob) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/attendance/lookup', {
        regNo,
        dateOfBirth: dob,
      });

      setAttendance(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch attendance. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Eligible':
        return 'status-eligible';
      case 'Condonation':
        return 'status-condonation';
      case 'Detained':
        return 'status-detained';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2">Attendance Lookup</h1>
          <p className="text-white/60">View your attendance records</p>
        </div>

        <GlassCard className="p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/80 mb-2 font-medium">
                  Registration Number
                </label>
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
                <label className="block text-white/80 mb-2 font-medium">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full"
                  disabled={loading}
                />
              </div>
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
              {loading ? 'Fetching...' : 'View Attendance'}
            </button>
          </form>
        </GlassCard>

        {attendance && (
          <GlassCard className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {attendance.studentName}
              </h2>
              <p className="text-white/60">Reg No: {attendance.regNo}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-lg">Overall Attendance:</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gold">
                    {attendance.overallPercentage.toFixed(2)}%
                  </span>
                  <span className={getStatusClass(attendance.status)}>
                    {attendance.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Attended</th>
                    <th>Total</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.subjects.map((subject, index) => (
                    <tr key={index}>
                      <td className="font-medium">{subject.name}</td>
                      <td>{subject.attended}</td>
                      <td>{subject.total}</td>
                      <td>
                        <span
                          className={`font-semibold ${
                            subject.percentage >= 75
                              ? 'text-green-400'
                              : subject.percentage >= 65
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}
                        >
                          {subject.percentage.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default AttendanceLookup;
