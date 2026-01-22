import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MobileMenu from '../components/MobileMenu';
import api from '../api/axios';

interface AttendanceRecord {
  _id: string;
  studentName: string;
  regNo: string;
  subject: string;
  attended: number;
  total: number;
  percentage: number;
  status: 'Eligible' | 'Condonation' | 'Detained';
}

const AttendanceManage = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ attended: 0, total: 0 });
  const userType = localStorage.getItem('userType');
  const isStudent = userType === 'student';

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance');
      setRecords(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: AttendanceRecord) => {
    if (isStudent) return; // Prevent editing for students
    setEditingId(record._id);
    setEditValues({ attended: record.attended, total: record.total });
  };

  const handleSave = async (id: string) => {
    try {
      await api.put(`/attendance/update`, {
        id,
        attended: editValues.attended,
        total: editValues.total,
      });

      setRecords(
        records.map((record) => {
          if (record._id === id) {
            const percentage = (editValues.attended / editValues.total) * 100;
            let status: 'Eligible' | 'Condonation' | 'Detained' = 'Detained';
            if (percentage >= 75) status = 'Eligible';
            else if (percentage >= 65) status = 'Condonation';

            return {
              ...record,
              attended: editValues.attended,
              total: editValues.total,
              percentage,
              status,
            };
          }
          return record;
        })
      );

      setEditingId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update attendance');
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
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <MobileMenu />
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {isStudent && (
            <div className="mb-6 bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">👁️</span>
                <p className="font-semibold">Read-Only Student View - You cannot edit attendance</p>
              </div>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gold mb-8">Attendance Management</h1>

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
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Reg No</th>
                      <th>Subject</th>
                      <th>Attended</th>
                      <th>Total</th>
                      <th>Percentage</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length > 0 ? (
                      records.map((record) => (
                        <tr key={record._id}>
                          <td className="font-medium">{record.studentName}</td>
                          <td>{record.regNo}</td>
                          <td>{record.subject}</td>
                          <td>
                            {editingId === record._id ? (
                              <input
                                type="number"
                                value={editValues.attended}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    attended: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-20 px-2 py-1"
                                min="0"
                              />
                            ) : (
                              record.attended
                            )}
                          </td>
                          <td>
                            {editingId === record._id ? (
                              <input
                                type="number"
                                value={editValues.total}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    total: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-20 px-2 py-1"
                                min="0"
                              />
                            ) : (
                              record.total
                            )}
                          </td>
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
                          <td>
                            {editingId === record._id ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSave(record._id)}
                                  className="text-green-400 hover:text-green-300 font-medium"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-red-400 hover:text-red-300 font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              !isStudent && (
                                <button
                                  onClick={() => handleEdit(record)}
                                  className="text-gold hover:text-gold/80 font-medium"
                                >
                                  Edit
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center text-white/60">
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

export default AttendanceManage;
