import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MobileMenu from '../components/MobileMenu';
import api from '../api/axios';

interface LeaveRequest {
  _id: string;
  studentName: string;
  regNo: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const Leaves = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userType = localStorage.getItem('userType');
  const isStudent = userType === 'student';
  const student = isStudent ? JSON.parse(localStorage.getItem('student') || '{}') : null;

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/leaves');
      let leavesData = response.data;
      
      // Filter to show only student's own leaves if they're a student
      if (isStudent && student?.regNo) {
        leavesData = leavesData.filter((leave: LeaveRequest) => leave.regNo === student.regNo);
      }
      
      setLeaves(leavesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await api.put(`/leaves/${id}`, { status });

      setLeaves(
        leaves.map((leave) =>
          leave._id === id ? { ...leave, status } : leave
        )
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update leave status');
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'status-eligible';
      case 'Rejected':
        return 'status-detained';
      case 'Pending':
        return 'status-condonation';
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
                <p className="font-semibold">Read-Only Student View - Viewing your approved leaves only</p>
              </div>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gold mb-8">Leave Requests</h1>

          {loading ? (
            <GlassCard className="p-8 text-center">
              <p className="text-white/60">Loading leave requests...</p>
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
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.length > 0 ? (
                      leaves.map((leave) => (
                        <tr key={leave._id}>
                          <td className="font-medium">{leave.studentName}</td>
                          <td>{leave.regNo}</td>
                          <td className="text-white/60">
                            {new Date(leave.startDate).toLocaleDateString()}
                          </td>
                          <td className="text-white/60">
                            {new Date(leave.endDate).toLocaleDateString()}
                          </td>
                          <td className="text-white/60 max-!isStudent && w-xs truncate">
                            {leave.reason}
                          </td>
                          <td>
                            <span className={getStatusClass(leave.status)}>
                              {leave.status}
                            </span>
                          </td>
                          <td>
                            {leave.status === 'Pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                                  className="text-green-400 hover:text-green-300 font-medium"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                                  className="text-red-400 hover:text-red-300 font-medium"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center text-white/60">
                          No leave requests found
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

export default Leaves;
