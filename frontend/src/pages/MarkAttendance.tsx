import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MobileMenu from '../components/MobileMenu';
import api from '../api/axios';

interface Student {
  _id: string;
  name: string;
  regNo: string;
}

interface AttendanceRecord {
  studentId: string;
  present: boolean;
}

const ALLOWED_SUBJECTS = ['ME', 'MP', 'DBMS', 'DAA', 'FLAT'];

const MarkAttendance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
      
      // Initialize all students as present by default
      const initialAttendance = new Map<string, boolean>();
      response.data.forEach((student: Student) => {
        initialAttendance.set(student._id, true);
      });
      setAttendance(initialAttendance);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (studentId: string) => {
    setAttendance(prev => {
      const newMap = new Map(prev);
      newMap.set(studentId, !newMap.get(studentId));
      return newMap;
    });
  };

  const markAllPresent = () => {
    setAttendance(prev => {
      const newMap = new Map(prev);
      students.forEach(student => newMap.set(student._id, true));
      return newMap;
    });
  };

  const markAllAbsent = () => {
    setAttendance(prev => {
      const newMap = new Map(prev);
      students.forEach(student => newMap.set(student._id, false));
      return newMap;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }

    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setSubmitting(true);

    try {
      const records: AttendanceRecord[] = students.map(student => ({
        studentId: student._id,
        present: attendance.get(student._id) || false
      }));

      const response = await api.post('/attendance/mark', {
        subject: selectedSubject,
        date: selectedDate,
        records
      });

      setSuccess(`Attendance marked successfully! Processed: ${response.data.processed} students`);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(
    student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = Array.from(attendance.values()).filter(p => p).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <MobileMenu />
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gold mb-4">Mark Attendance</h1>
          <p className="text-white/60 mb-8">Select subject and date, then mark students as present or absent below</p>

          <form onSubmit={handleSubmit}>
            <GlassCard className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Step 1: Select Subject & Date</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white/80 mb-2 font-medium">Subject *</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold/50 cursor-pointer"
                    required
                  >
                    <option value="" className="bg-gray-900 text-white">Select Subject</option>
                    {ALLOWED_SUBJECTS.map(subject => (
                      <option key={subject} value={subject} className="bg-gray-900 text-white py-2">
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 mb-2 font-medium">Date *</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold/50"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={markAllPresent}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={markAllAbsent}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Mark All Absent
                </button>
              </div>

              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-semibold">Present:</span>
                  <span className="text-white">{presentCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-semibold">Absent:</span>
                  <span className="text-white">{absentCount}</span>
                </div>
              </div>
            </GlassCard>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            <GlassCard className="p-6 mb-6">
              <input
                type="text"
                placeholder="Search by name or registration number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </GlassCard>

            {loading ? (
              <GlassCard className="p-8 text-center">
                <p className="text-white/60">Loading students...</p>
              </GlassCard>
            ) : (
              <>
                <GlassCard className="p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Step 2: Mark Students Present/Absent</h2>
                    <p className="text-sm text-white/60">Total: {filteredStudents.length} students</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table>
                      <thead>
                        <tr>
                          <th>Reg No</th>
                          <th>Name</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => {
                            const isPresent = attendance.get(student._id) || false;
                            return (
                              <tr key={student._id}>
                                <td className="font-medium">{student.regNo}</td>
                                <td>{student.name}</td>
                                <td>
                                  <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                      isPresent
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-red-500/20 text-red-400'
                                    }`}
                                  >
                                    {isPresent ? '✓ Present' : '✗ Absent'}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    onClick={() => toggleAttendance(student._id)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                      isPresent
                                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    }`}
                                  >
                                    Mark {isPresent ? 'Absent' : 'Present'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center text-white/60">
                              No students found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>

                <div className="flex justify-end gap-4">
                  <a
                    href="/admin/attendance/view"
                    className="btn-secondary px-6 py-3"
                  >
                    View All Attendance
                  </a>
                  <button
                    type="submit"
                    disabled={submitting || !selectedSubject}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 text-lg"
                  >
                    {submitting ? 'Submitting...' : 'Submit Attendance'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
