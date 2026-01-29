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
  createdAt?: string;
  reviewedAt?: string;
}

const Leaves = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    regNo: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  
  const userType = localStorage.getItem('userType');
  const isStudent = userType === 'student';
  const studentData = isStudent ? JSON.parse(localStorage.getItem('student') || '{}') : null;

  useEffect(() => {
    fetchLeaves();
    
    // Pre-fill form if student is logged in
    if (isStudent && studentData) {
      console.log('Pre-filling form with student data:', studentData);
      
      setFormData(prev => ({
        ...prev,
        regNo: studentData.regNo || ''
      }));
    }
  }, [isStudent, studentData?.regNo]);

  const fetchLeaves = async () => {
    try {
      let response;
      
      if (isStudent && studentData?.regNo && studentData?.dob) {
        // Student: fetch only their own leaves
        // DOB is already in YYYY-MM-DD format
        response = await api.get(`/leaves?regNo=${studentData.regNo}&dob=${studentData.dob}`);
      } else {
        // CR: fetch all leaves
        response = await api.get('/leaves');
      }
      
      setLeaves(response.data.leaveRequests || response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await api.put(`/leaves/${id}`, { status });

      // Update the local state
      setLeaves(
        leaves.map((leave) =>
          leave._id === id ? { ...leave, status, reviewedAt: new Date().toISOString() } : leave
        )
      );
      
      // Show success message
      alert(`Leave request ${status.toLowerCase()} successfully!`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update leave status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('=== LEAVE REQUEST SUBMISSION DEBUG ===');
    console.log('Form Data:', formData);
    console.log('Student Data from localStorage:', studentData);

    if (!formData.regNo || !formData.startDate || !formData.endDate || !formData.reason) {
      setError('All fields are required');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must be after start date');
      return;
    }

    setSubmitting(true);

    try {
      // Format the dates properly before sending
      const submitData = {
        regNo: formData.regNo.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim()
      };

      console.log('Submitting leave request:', submitData);

      const response = await api.post('/leaves', submitData);
      
      console.log('Leave request submitted successfully:', response.data);

      // Reset form
      setFormData({
        regNo: isStudent && studentData ? studentData.regNo : '',
        startDate: '',
        endDate: '',
        reason: ''
      });

      setShowModal(false);
      
      // Refresh the list
      await fetchLeaves();
      
      alert('Leave request submitted successfully!');
    } catch (err: any) {
      console.error('=== LEAVE SUBMISSION ERROR ===');
      console.error('Full error:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      console.error('Error message:', err.message);
      
      let errorMessage = 'Failed to submit leave request';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setSubmitting(false);
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gold mb-2">Leave Requests</h1>
              <p className="text-white/60">
                {isStudent ? 'View your leave requests and apply for new ones' : 'Manage student leave requests'}
              </p>
            </div>
            {isStudent && (
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary"
              >
                + Apply for Leave
              </button>
            )}
          </div>

          {/* Leave Application Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <GlassCard className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gold">Apply for Leave</h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setError('');
                    }}
                    className="text-white/60 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 mb-2 font-medium">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        value={formData.regNo}
                        onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                        placeholder="e.g., URK21CS1001"
                        className="w-full"
                        disabled={isStudent}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2 font-medium">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2 font-medium">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full"
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2 font-medium">
                      Reason for Leave *
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Please provide a detailed reason for your leave request..."
                      className="w-full min-h-[120px] px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-gold/50 resize-vertical"
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setError('');
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit Leave Request'}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </div>
          )}

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
              {leaves.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/60 text-lg mb-4">No leave requests found</p>
                  {isStudent && (
                    <button
                      onClick={() => setShowModal(true)}
                      className="btn-primary"
                    >
                      Apply for Leave
                    </button>
                  )}
                </div>
              ) : (
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
                        {!isStudent && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map((leave) => (
                        <tr key={leave._id}>
                          <td className="font-medium">{leave.studentName}</td>
                          <td>{leave.regNo}</td>
                          <td className="text-white/60">
                            {new Date(leave.startDate).toLocaleDateString()}
                          </td>
                          <td className="text-white/60">
                            {new Date(leave.endDate).toLocaleDateString()}
                          </td>
                          <td className="text-white/60 max-w-xs truncate" title={leave.reason}>
                            {leave.reason}
                          </td>
                          <td>
                            <span className={getStatusClass(leave.status)}>
                              {leave.status}
                            </span>
                          </td>
                          {!isStudent && (
                            <td>
                              {leave.status === 'Pending' ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                                    className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-medium text-sm"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                                    className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium text-sm"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-white/40 text-sm">
                                  {leave.status}
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaves;
