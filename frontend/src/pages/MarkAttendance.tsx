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
  status: 'Present' | 'Absent';
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showAlreadyMarkedModal, setShowAlreadyMarkedModal] = useState(false);
  const [alreadyMarkedMessage, setAlreadyMarkedMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [alreadyMarked, setAlreadyMarked] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  // Check for existing attendance when subject or date changes
  useEffect(() => {
    if (selectedSubject && selectedDate) {
      checkExistingAttendance();
    }
  }, [selectedSubject, selectedDate]);

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

  const checkExistingAttendance = async () => {
    try {
      const response = await api.get('/attendance/for-edit', {
        params: { date: selectedDate, subject: selectedSubject }
      });

      if (response.data.alreadyMarked) {
        // Load existing attendance data
        setAlreadyMarked(true);
        setIsReadOnly(true);
        setIsEditMode(false);

        // Update attendance map with existing data
        const existingAttendance = new Map<string, boolean>();
        response.data.records.forEach((record: any) => {
          existingAttendance.set(record.studentId, record.status === 'Present');
        });
        setAttendance(existingAttendance);
      }
    } catch (err: any) {
      // If 404, attendance not marked yet - this is fine
      if (err.response?.status === 404) {
        setAlreadyMarked(false);
        setIsReadOnly(false);
        setIsEditMode(false);
        
        // Reset to all present
        const resetAttendance = new Map<string, boolean>();
        students.forEach((student) => {
          resetAttendance.set(student._id, true);
        });
        setAttendance(resetAttendance);
      }
    }
  };

  const toggleAttendance = (studentId: string) => {
    if (isReadOnly) return; // Don't allow changes in read-only mode
    
    setAttendance(prev => {
      const newMap = new Map(prev);
      newMap.set(studentId, !newMap.get(studentId));
      return newMap;
    });
  };

  const markAllPresent = () => {
    if (isReadOnly) return; // Don't allow changes in read-only mode
    
    setAttendance(prev => {
      const newMap = new Map(prev);
      students.forEach(student => newMap.set(student._id, true));
      return newMap;
    });
  };

  const markAllAbsent = () => {
    if (isReadOnly) return; // Don't allow changes in read-only mode
    
    setAttendance(prev => {
      const newMap = new Map(prev);
      students.forEach(student => newMap.set(student._id, false));
      return newMap;
    });
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setIsReadOnly(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setIsReadOnly(true);
    // Reload existing attendance
    checkExistingAttendance();
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
        status: attendance.get(student._id) ? 'Present' : 'Absent'
      }));

      let response;
      
      // Use update endpoint if already marked and in edit mode
      if (alreadyMarked && isEditMode) {
        response = await api.put('/attendance/update', {
          subject: selectedSubject,
          date: selectedDate,
          records
        });
        
        setSuccessMessage(`Attendance updated successfully! ${response.data.changed} records changed.`);
        setShowSuccessModal(true);
        
        // Exit edit mode and return to read-only
        setIsEditMode(false);
        setIsReadOnly(true);
        setAlreadyMarked(true);
      } else {
        // Mark new attendance
        response = await api.post('/attendance/mark', {
          subject: selectedSubject,
          date: selectedDate,
          records
        });

        setSuccessMessage(`Attendance submitted successfully! Processed: ${response.data.processed} students`);
        setShowSuccessModal(true);
        
        // Now it's marked, switch to read-only mode
        setAlreadyMarked(true);
        setIsReadOnly(true);
        setIsEditMode(false);
      }
      
      setSuccess(`Operation completed successfully!`);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to process attendance';
      
      // Check if attendance already marked (409 status)
      if (err.response?.status === 409 && err.response?.data?.alreadyMarked) {
        // Load the existing attendance data
        const existingData = err.response.data;
        setAlreadyMarked(true);
        setIsReadOnly(true);
        setIsEditMode(false);
        
        // Update attendance map with existing data
        const existingAttendance = new Map<string, boolean>();
        existingData.records.forEach((record: any) => {
          existingAttendance.set(record.studentId, record.status === 'Present');
        });
        setAttendance(existingAttendance);
        
        setAlreadyMarkedMessage(errorMessage);
        setShowAlreadyMarkedModal(true);
      } else {
        setError(errorMessage);
      }
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
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-green-500/50 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-[slideIn_0.3s_ease-out]">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Success Title */}
              <h2 className="text-2xl font-bold text-white mb-2">Successfully Submitted!</h2>
              
              {/* Success Message */}
              <p className="text-green-400 mb-6">{successMessage}</p>
              
              {/* Close Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-6 py-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-semibold"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Already Marked Modal */}
      {showAlreadyMarkedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-yellow-500/50 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-[slideIn_0.3s_ease-out]">
            <div className="text-center">
              {/* Info Icon */}
              <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              {/* Info Title */}
              <h2 className="text-2xl font-bold text-white mb-2">Already Marked</h2>
              
              {/* Info Message */}
              <p className="text-yellow-400 mb-6">{alreadyMarkedMessage}</p>
              
              {/* Close Button */}
              <button
                onClick={() => setShowAlreadyMarkedModal(false)}
                className="w-full px-6 py-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors font-semibold"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gold mb-2">Mark Attendance</h1>
              <p className="text-white/60">Select subject and date, then mark students as present or absent below</p>
            </div>
            {isEditMode && (
              <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/50 text-orange-400 rounded-lg font-semibold animate-pulse">
                ✏️ Edit Mode Active
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <GlassCard className="p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Step 1: Select Subject & Date</h2>
                {alreadyMarked && (
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg text-sm font-semibold">
                    Already Marked
                  </span>
                )}
              </div>
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
                  disabled={isReadOnly}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={markAllAbsent}
                  disabled={isReadOnly}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    disabled={isReadOnly}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
                  
                  {alreadyMarked && isReadOnly && !isEditMode && (
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="px-8 py-3 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors font-semibold text-lg"
                    >
                      Edit Attendance
                    </button>
                  )}
                  
                  {alreadyMarked && isEditMode && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-3 bg-gray-500/20 border border-gray-500/50 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                  
                  {(!alreadyMarked || isEditMode) && (
                    <button
                      type="submit"
                      disabled={submitting || !selectedSubject || (alreadyMarked && !isEditMode)}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 text-lg"
                    >
                      {submitting 
                        ? (isEditMode ? 'Updating...' : 'Submitting...') 
                        : (isEditMode ? 'Save Changes' : 'Submit Attendance')
                      }
                    </button>
                  )}
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
