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

interface AttendanceData {
  subject: string;
  attended: number;
  total: number;
  percentage: number;
  status: 'Eligible' | 'Condonation' | 'Detained';
}

interface StudentWithAttendance extends Student {
  attendance: AttendanceData[];
}

const AttendanceManage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingAttendance, setFetchingAttendance] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAttendance = async (studentId: string) => {
    setFetchingAttendance(true);
    setError('');
    setAttendanceData([]);
    
    try {
      const student = students.find(s => s._id === studentId);
      if (!student) return;

      // Get attendance data for this specific student
      // Note: This would need a backend endpoint to fetch attendance by studentId
      // For now, we'll show a placeholder message
      const response = await api.get(`/attendance/student/${studentId}`);
      setAttendanceData(response.data);
    } catch (err: any) {
      setError('Attendance data fetch endpoint not yet implemented. Use student lookup instead.');
      setAttendanceData([]);
    } finally {
      setFetchingAttendance(false);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId);
    if (studentId) {
      fetchStudentAttendance(studentId);
    } else {
      setAttendanceData([]);
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

  const filteredStudents = students.filter(
    student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <MobileMenu />
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gold mb-8">View Attendance Records</h1>

          <GlassCard className="p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 font-medium">Search Student</label>
                <input
                  type="text"
                  placeholder="Search by name or registration number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">Select Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold/50 cursor-pointer"
                >
                  <option value="" className="bg-gray-900 text-white py-2">-- Select a student --</option>
                  {filteredStudents.map(student => (
                    <option key={student._id} value={student._id} className="bg-gray-900 text-white py-2">
                      {student.regNo} - {student.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCard>

          {error && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold mb-2">⚠️ Note:</p>
              <p>{error}</p>
              <p className="mt-2 text-sm">Students can use the "Attendance Lookup" page to view their attendance using Reg No + DOB.</p>
            </div>
          )}

          {loading ? (
            <GlassCard className="p-8 text-center">
              <p className="text-white/60">Loading students...</p>
            </GlassCard>
          ) : fetchingAttendance ? (
            <GlassCard className="p-8 text-center">
              <p className="text-white/60">Loading attendance data...</p>
            </GlassCard>
          ) : attendanceData.length > 0 ? (
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Attendance Summary</h2>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Attended</th>
                      <th>Total</th>
                      <th>Percentage</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((record, index) => (
                      <tr key={index}>
                        <td className="font-medium">{record.subject}</td>
                        <td>{record.attended}</td>
                        <td>{record.total}</td>
                        <td>
                          <span
                            className={`font-semibold ${
                              record.percentage >= 75
                                ? 'text-green-400'
                                : record.percentage >= 65
                                ? 'text-yellow-400'
                                : 'text-red-400'
                            }`}
                          >
                            {record.percentage.toFixed(2)}%
                          </span>
                        </td>
                        <td>
                          <span className={getStatusClass(record.status)}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          ) : selectedStudent ? (
            <GlassCard className="p-8 text-center">
              <p className="text-white/60">No attendance records found for this student</p>
            </GlassCard>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManage;
