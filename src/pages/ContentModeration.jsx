import { useState, useEffect } from 'react';
import { MessageSquare, AlertTriangle, MessageCircle, AlertCircle, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios';
import { usePolling } from '../hooks/usePolling';

const ContentModeration = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  // Broadcast modal state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');

  const fetchPosts = async () => {
    try {
      const [announcementsRes, questionsRes] = await Promise.all([
        api.get('/announcements'),
        api.get('/qa') // Assuming /qa returns all questions based on the backend routes
      ]);

      const announcements = announcementsRes.data.map(a => ({
        id: a._id || a.id,
        type: 'Announcement',
        author: a.authorId?.name || a.authorName || 'Unknown',
        content: a.title || a.content,
        date: new Date(a.createdAt || Date.now()).toLocaleString(),
        original: a
      }));

      const questions = questionsRes.data.map(q => ({
        id: q._id || q.id,
        type: 'Question',
        author: q.authorName || 'Unknown',
        content: q.title || q.content,
        date: new Date(q.createdAt || Date.now()).toLocaleString(),
        original: q
      }));

      // Combine and sort by date descending (assuming we just show all of them as "flagged/reviewable" content)
      const allPosts = [...announcements, ...questions];
      setReports(allPosts);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setLoading(false);
    }
  };

  usePolling(fetchPosts, 10000);

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      if (type === 'Announcement') {
        await api.delete(`/admin/announcements/${id}`);
      } else {
        await api.delete(`/admin/questions/${id}`);
      }
      toast.success(`${type} removed successfully`);
      fetchPosts();
    } catch (error) {
      toast.error(`Failed to delete ${type}`);
    }
  };

  const handleDismiss = (id) => {
    // In a real system, this might hide it from the UI or mark it as safe. 
    // Since we're just listing all posts like the flutter app does, we'll just filter it locally.
    setReports(prev => prev.filter(r => r.id !== id));
    toast.success('Removed from view');
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastContent.trim()) return;

    try {
      await api.post('/announcements', {
        title: broadcastTitle,
        content: broadcastContent,
        category: 'general'
      });
      toast.success('Announcement broadcasted successfully!');
      setShowBroadcastModal(false);
      setBroadcastTitle('');
      setBroadcastContent('');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to broadcast announcement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Content Moderation</h1>
          <p className="text-text-secondary mt-1">Review reported content and announcements</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 appearance-none cursor-pointer pr-8"
            >
              <option value="All">All Content</option>
              <option value="Announcement">Announcements Only</option>
              <option value="Question">Questions Only</option>
            </select>
          </div>
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="bg-brand hover:bg-brand-dark text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Megaphone className="w-4 h-4" />
            Broadcast
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports Panel */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            All Posts & Announcements
          </h2>
          
          {loading ? (
             <div className="text-center py-12 text-gray-500 bg-white rounded-[20px] border border-border">
                Loading content...
             </div>
          ) : reports.filter(r => filter === 'All' || r.type === filter).length === 0 ? (
             <div className="text-center py-12 text-gray-500 bg-white rounded-[20px] border border-border">
                No content found.
             </div>
          ) : (
            reports.filter(r => filter === 'All' || r.type === filter).map((report) => (
              <div key={`${report.type}-${report.id}`} className="bg-white p-5 rounded-[20px] shadow-[0_4px_30px_rgba(30,64,175,0.05)] border border-orange-100 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-1">
                    {report.type === 'Question' ? <MessageCircle className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-text-primary">{report.author}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{report.type}</span>
                      <span className="text-xs text-gray-400">{report.date}</span>
                    </div>
                    <p className="text-text-secondary text-sm bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2">
                      "{report.content}"
                    </p>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => handleDelete(report.id, report.type)}
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors w-full"
                  >
                    Delete
                  </button>
                  <button 
                    onClick={() => handleDismiss(report.id)}
                    className="px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors w-full"
                  >
                    Ignore
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-brand" />
            Moderation Stats
          </h2>
          <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_30px_rgba(30,64,175,0.05)] border border-border">
             <div className="space-y-4">
               <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                 <span className="text-gray-500">Total Posts</span>
                 <span className="text-lg font-bold text-orange-500">{reports.length}</span>
               </div>
               <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                 <span className="text-gray-500">Announcements</span>
                 <span className="text-lg font-bold text-text-primary">{reports.filter(r => r.type === 'Announcement').length}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500">Questions</span>
                 <span className="text-lg font-bold text-text-primary">{reports.filter(r => r.type === 'Question').length}</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-6 border border-border relative overflow-hidden">
            <div className="mb-6 relative z-10">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-brand" />
                Broadcast Announcement
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                This will be visible to all users across all courses.
              </p>
            </div>

            <form onSubmit={handleBroadcast} className="relative z-10">
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 text-text-primary"
                  placeholder="Important update..."
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Message Content
                </label>
                <textarea
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 text-text-primary min-h-[120px] resize-y"
                  placeholder="Write your announcement here..."
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!broadcastTitle.trim() || !broadcastContent.trim()}
                  className="flex-1 py-3 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentModeration;
