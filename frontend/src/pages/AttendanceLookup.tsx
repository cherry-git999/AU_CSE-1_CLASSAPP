import { useState } from 'react';
import type { FormEvent } from 'react';
import GlassCard from '../components/GlassCard';
import api from '../api/axios';

interface AttendanceSubject {
  subject: string;
  attended: number;
  total: number;
  percentage: number;
  status: string;
}

interface DateSubject {
  subject: string;
  status: string;
}

interface AttendanceResponse {
  name: string;
  regNo: string;
  attendance: AttendanceSubject[];
  date?: string;
  subjects?: DateSubject[];
  overallAttendance?: AttendanceSubject[];
}

const AttendanceLookup = () => {
  const [regNo, setRegNo] = useState('');
  const [dob, setDob] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setData(null);

    if (!regNo || !dob) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const requestBody: any = {
        regNo,
        dob
      };

      // Add date if selected
      if (selectedDate) {
        requestBody.date = selectedDate;
      }

      const response = await api.post('/attendance/lookup', requestBody);

      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch attendance. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Eligible':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'Condonation':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Detained':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  // Determine which attendance to display
  const displayAttendance = data?.overallAttendance || data?.attendance || [];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2">Attendance Lookup</h1>
          <p className="text-white/60">View your attendance records - Overall summary or date-specific details</p>
        </div>

        <GlassCard className="p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-white/80 mb-2 font-medium">
                  Registration Number *
                </label>
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  placeholder="e.g., URK21CS1001"
                  className="w-full"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">
                  Specific Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                  disabled={loading}
                  placeholder="Leave empty for overall"
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

        {data && (
          <>
            {/* Student Info */}
            <GlassCard className="p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {data.name}
                  </h2>
                  <p className="text-white/60">Reg No: {data.regNo}</p>
                </div>
              </div>
            </GlassCard>

            {/* Overall Attendance by Subject */}
            <GlassCard className="p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">
                {data.date ? `📅 Attendance on ${data.date}` : '📊 Overall Attendance Summary'}
              </h3>

              {/* If date-specific view, show subjects for that date */}
              {data.date && data.subjects && data.subjects.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white/80 mb-3">Classes on {data.date}</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.subjects.map((subj, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          subj.status === 'Present'
                            ? 'bg-green-500/10 border-green-500/50'
                            : 'bg-red-500/10 border-red-500/50'
                        }`}
                      >
                        <div className="font-bold text-white mb-1">{subj.subject}</div>
                        <div
                          className={`text-sm font-semibold ${
                            subj.status === 'Present' ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {subj.status === 'Present' ? '✓ Present' : '✗ Absent'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall attendance table */}
              {displayAttendance.length > 0 && (
                <>
                  {data.date && <h4 className="text-lg font-semibold text-white/80 mb-3 mt-6">Overall Summary</h4>}
                  <div className="overflow-x-auto">
                    <table>
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Attended</th>
                          <th>Total Classes</th>
                          <th>Percentage</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayAttendance.map((subject, index) => (
                          <tr key={index}>
                            <td className="font-medium">{subject.subject}</td>
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
                                {subject.percentage.toFixed(1)}%
                              </span>
                            </td>
                            <td>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusClass(subject.status)}`}>
                                {subject.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* No data message */}
              {displayAttendance.length === 0 && (!data.subjects || data.subjects.length === 0) && (
                <div className="text-center text-white/60 py-8">
                  {data.date ? `No classes conducted on ${data.date}` : 'No attendance records found'}
                </div>
              )}
            </GlassCard>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceLookup;
