import { useState, useEffect } from 'react';
import { Check, X, Trash2, Search, Filter, Clock } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios';
import { usePolling } from '../hooks/usePolling';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, student, teacher

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setLoading(false);
    }
  };

  usePolling(fetchUsers, 10000);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/users/${id}/approve`);
      toast.success('User approved successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = (user.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
                          (user.email?.toLowerCase() || '').includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'pending') return !user.approved;
    if (filter === 'approved') return user.approved;
    if (filter === 'student') return user.role === 'student';
    if (filter === 'teacher') return user.role === 'teacher';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-text-secondary mt-1">Manage students, teachers and approvals</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 w-64"
            />
          </div>
          
          <div className="relative">
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 appearance-none cursor-pointer"
            >
              <option value="all">All Users</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="student">Students Only</option>
              <option value="teacher">Teachers Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[20px] shadow-[0_4px_30px_rgba(30,64,175,0.05)] border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No users found</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{user.name}</p>
                          <p className="text-xs text-text-secondary">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.approved ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
                          <Check className="w-4 h-4" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-orange-500 text-sm font-medium">
                          <Clock className="w-4 h-4" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!user.approved && (
                          <button
                            onClick={() => handleApprove(user._id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve User"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
