import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MobileMenu from '../components/MobileMenu';
import api from '../api/axios';

interface SubjectAttendance {
  attended: number;
  total: number;
  percentage: number;
  status: string;
}

interface StudentAttendanceData {
  regNo: string;
  name: string;
  ME: SubjectAttendance;
  MP: SubjectAttendance;
  DBMS: SubjectAttendance;
  DAA: SubjectAttendance;
  FLAT: SubjectAttendance;
}

const SUBJECTS = ['ME', 'MP', 'DBMS', 'DAA', 'FLAT'];

const ViewAllAttendance = () => {
  const [attendanceData, setAttendanceData] = useState<StudentAttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    fetchAllAttendance();
  }, []);

  const fetchAllAttendance = async () => {
    try {
      const response = await api.get('/attendance/all');
      setAttendanceData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    // Create CSV header
    const headers = ['Reg No', 'Student Name'];
    SUBJECTS.forEach(subject => {
      headers.push(`${subject} - Attended`, `${subject} - Total`, `${subject} - %`, `${subject} - Status`);
    });
    
    // Create CSV rows
    const rows = filteredData.map(student => {
      const row = [student.regNo, student.name];
      SUBJECTS.forEach(subject => {
        const attendance = student[subject as keyof StudentAttendanceData] as SubjectAttendance;
        row.push(
          attendance.attended.toString(),
          attendance.total.toString(),
          attendance.percentage.toFixed(2),
          attendance.status
        );
      });
      return row;
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = attendanceData.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.regNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedSubject === 'all') return matchesSearch;
    
    // Filter by subject if selected
    const subjectData = student[selectedSubject as keyof StudentAttendanceData] as SubjectAttendance;
    return matchesSearch && subjectData.total > 0;
  });

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

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <MobileMenu />
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gold">View All Attendance</h1>
            <button
              onClick={downloadCSV}
              disabled={loading || attendanceData.length === 0}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>📥</span>
              Download CSV
            </button>
          </div>

          <GlassCard className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-white/80 mb-2 font-medium">Filter by Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold/50 cursor-pointer"
                >
                  <option value="all" className="bg-gray-900 text-white py-2">All Subjects</option>
                  {SUBJECTS.map(subject => (
                    <option key={subject} value={subject} className="bg-gray-900 text-white py-2">
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCard>

          {loading ? (
            <GlassCard className="p-8 text-center">
              <p className="text-white/60">Loading attendance records...</p>
            </GlassCard>
          ) : error ? (
            <GlassCard className="p-8">
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <p className="text-white/80">
                  Showing <span className="text-gold font-semibold">{filteredData.length}</span> students
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="sticky left-0 bg-black/40 backdrop-blur-sm">Reg No</th>
                      <th className="sticky left-0 bg-black/40 backdrop-blur-sm">Student Name</th>
                      {SUBJECTS.map(subject => (
                        <th key={subject} colSpan={2} className="text-center border-l border-white/10">
                          {subject}
                        </th>
                      ))}
                    </tr>
                    <tr className="text-xs">
                      <th className="sticky left-0 bg-black/40"></th>
                      <th className="sticky left-0 bg-black/40"></th>
                      {SUBJECTS.map(subject => (
                        <>
                          <th key={`${subject}-att`} className="border-l border-white/10">Att/Total (%)</th>
                          <th key={`${subject}-status`}>Status</th>
                        </>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((student) => (
                        <tr key={student.regNo}>
                          <td className="font-medium sticky left-0 bg-black/40 backdrop-blur-sm">{student.regNo}</td>
                          <td className="sticky left-0 bg-black/40 backdrop-blur-sm">{student.name}</td>
                          {SUBJECTS.map(subject => {
                            const attendance = student[subject as keyof StudentAttendanceData] as SubjectAttendance;
                            return (
                              <>
                                <td key={`${subject}-data`} className="text-center border-l border-white/10">
                                  {attendance.total > 0 ? (
                                    <div>
                                      <span className="text-white/80">
                                        {attendance.attended}/{attendance.total}
                                      </span>
                                      <span
                                        className={`ml-2 font-semibold ${
                                          attendance.percentage >= 75
                                            ? 'text-green-400'
                                            : attendance.percentage >= 65
                                            ? 'text-yellow-400'
                                            : 'text-red-400'
                                        }`}
                                      >
                                        ({attendance.percentage.toFixed(1)}%)
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-white/40">-</span>
                                  )}
                                </td>
                                <td key={`${subject}-status`} className="text-center">
                                  {attendance.total > 0 ? (
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusClass(attendance.status)}`}>
                                      {attendance.status}
                                    </span>
                                  ) : (
                                    <span className="text-white/40">-</span>
                                  )}
                                </td>
                              </>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={12} className="text-center text-white/60 py-8">
                          No attendance records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAllAttendance;
