import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MobileMenu from '../components/MobileMenu';
import api from '../api/axios';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin based on userType
    const userType = localStorage.getItem('userType');
    // Only admins (not students) can create announcements
    setIsAdmin(userType !== 'student');
    
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data.announcements || response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !content) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/announcements', { title, message: content });
      setTitle('');
      setContent('');
      setSuccess('Announcement created successfully');
      // Refresh announcements
      await fetchAnnouncements();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    setDeleting(id);
    setError('');
    setSuccess('');

    try {
      await api.delete(`/announcements/${id}`);
      setSuccess('Announcement deleted successfully');
      // Refresh announcements
      await fetchAnnouncements();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete announcement');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <MobileMenu />
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gold mb-8">Announcements</h1>

          {/* Only show create form to admin users */}
          {isAdmin && (
            <GlassCard className="p-6 mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Create New Announcement</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2 font-medium">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter announcement title"
                    className="w-full"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2 font-medium">Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter announcement content"
                    className="w-full min-h-[120px]"
                    disabled={submitting}
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create Announcement'}
                </button>
              </form>
            </GlassCard>
          )}

          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-white">All Announcements</h2>
            {loading ? (
              <GlassCard className="p-8 text-center">
                <p className="text-white/60">Loading announcements...</p>
              </GlassCard>
            ) : announcements.length > 0 ? (
              announcements.map((announcement) => (
                <GlassCard key={announcement._id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                      <span className="text-sm text-white/50 block mt-1">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(announcement._id)}
                        disabled={deleting === announcement._id}
                        className="ml-4 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting === announcement._id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                  <p className="text-white/70">{announcement.message}</p>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="p-8 text-center">
                <p className="text-white/60">No announcements yet</p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
