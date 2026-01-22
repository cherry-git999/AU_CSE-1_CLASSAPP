import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MobileMenu from '../components/MobileMenu';
import api from '../api/axios';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const userType = localStorage.getItem('userType');
  const isStudent = userType === 'student';

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data);
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
      const response = await api.post('/announcements', { title, content });
      setAnnouncements([response.data, ...announcements]);
      setTitle('');
      setContent('');
      setSuccess('Announcement created successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create announcement');
    } finally {
      setSubmitting(false);
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
                <p className="font-semibold">Read-Only Student View - You cannot create announcements</p>
              </div>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gold mb-8">Announcements</h1>

          {!isStudent && (
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
                    <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                    <span className="text-sm text-white/50">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white/70 mb-2">{announcement.content}</p>
                  <p className="text-sm text-gold">By: {announcement.createdBy}</p>
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
