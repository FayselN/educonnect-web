import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Shield, Lock, Save, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { updateUser, logout } from '../store/authSlice';
import api from '../api/axios';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateName = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    
    // In a real app with an update-profile endpoint, we would hit the API here.
    // Since the mobile app just updates locally (or mock updates), we'll do the same.
    dispatch(updateUser({ name: nameInput.trim() }));
    setIsEditingName(false);
    toast.success('Profile name updated successfully');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success(res.data.msg || 'Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      dispatch(logout());
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Admin Profile</h1>
        <p className="text-text-secondary mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-[20px] shadow-[0_4px_30px_rgba(30,64,175,0.05)] border border-border p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <h2 className="text-xl font-bold text-text-primary">{user?.name}</h2>
            <p className="text-text-secondary text-sm mb-4">{user?.email}</p>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand/10 text-brand rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Shield className="w-3.5 h-3.5" />
              {user?.role || 'Admin'}
            </div>

            <button 
              onClick={handleLogout}
              className="w-full py-2.5 flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Settings Area */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Profile */}
          <div className="bg-white rounded-[20px] shadow-[0_4px_30px_rgba(30,64,175,0.05)] border border-border p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Personal Information</h3>
            </div>
            
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  disabled={!isEditingName}
                  className="w-full px-4 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-border rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-text-secondary mt-1">Email cannot be changed.</p>
              </div>

              <div className="pt-2">
                {!isEditingName ? (
                  <button 
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
                  >
                    Edit Name
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Save Changes
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsEditingName(false);
                        setNameInput(user?.name || '');
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-[20px] shadow-[0_4px_30px_rgba(30,64,175,0.05)] border border-border p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Change Password</h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50"
                  placeholder="Enter current password"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
