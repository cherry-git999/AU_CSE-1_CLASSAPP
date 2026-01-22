import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MobileMenu from '../components/MobileMenu';
import api from '../api/axios';

interface Student {
  _id: string;
  name: string;
  regNo: string;
  email: string;
  dateOfBirth: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userType = localStorage.getItem('userType');
  const isStudent = userType === 'student';

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

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <p className="font-semibold">Read-Only Student View</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gold">Students</h1>
          </div>

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
                      <th>Registration No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Date of Birth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <tr key={student._id}>
                          <td className="font-medium">{student.regNo}</td>
                          <td>{student.name}</td>
                          <td className="text-white/60">{student.email}</td>
                          <td className="text-white/60">
                            {new Date(student.dateOfBirth).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Students;
