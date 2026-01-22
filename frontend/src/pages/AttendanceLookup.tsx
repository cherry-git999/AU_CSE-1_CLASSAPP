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

interface DetailedRecord {
  subject: string;
  date: string;
  present: boolean;
}

interface AttendanceResponse {
  name: string;
  regNo: string;
  attendance: AttendanceSubject[];
  detailedRecords: DetailedRecord[];
}

const AttendanceLookup = () => {
  const [regNo, setRegNo] = useState('');
  const [dob, setDob] = useState('');
  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

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
      const response = await api.post('/attendance/lookup', {
        regNo,
        dob
      });

      setData(response.data);
      setSelectedSubject('all');
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

  const filteredDetailedRecords = selectedSubject === 'all' 
    ? data?.detailedRecords || []
    : data?.detailedRecords.filter(r => r.subject === selectedSubject) || [];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2">Attendance Lookup</h1>
          <p className="text-white/60">View your attendance records - Overall summary and date-wise details</p>
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
                  placeholder="e.g., AU001"
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
              <h3 className="text-xl font-bold text-white mb-4">📊 Overall Attendance Summary</h3>
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
                    {data.attendance.length > 0 ? (
                      data.attendance.map((subject, index) => (
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center text-white/60">
                          No attendance records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Date-wise Attendance Details */}
            {data.detailedRecords && data.detailedRecords.length > 0 && (
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">📅 Date-wise Attendance Records</h3>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold/50 cursor-pointer"
                  >
                    <option value="all" className="bg-gray-900 text-white py-2">All Subjects</option>
                    {data.attendance.map(s => (
                      <option key={s.subject} value={s.subject} className="bg-gray-900 text-white py-2">
                        {s.subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDetailedRecords.length > 0 ? (
                        filteredDetailedRecords.map((record, index) => (
                          <tr key={index}>
                            <td className="font-medium">
                              {new Date(record.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td>{record.subject}</td>
                            <td>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  record.present
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                              >
                                {record.present ? '✓ Present' : '✗ Absent'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center text-white/60">
                            No records found for selected subject
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceLookup;
