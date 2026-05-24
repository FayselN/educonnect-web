import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginSuccess } from '../store/authSlice';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.user.role !== 'admin') {
        toast.error('Access denied. Admin only.');
        setLoading(false);
        return;
      }
      
      dispatch(loginSuccess(response.data));
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary relative overflow-hidden">
      {/* Background decoration matching Flutter app gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-light/10 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-[20px] shadow-[0_4px_30px_rgba(30,64,175,0.15)] z-10 border border-white">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand to-brand-dark text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold">E</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Admin Portal</h1>
          <p className="text-text-secondary mt-2">Sign in to manage EduConnect</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all bg-bg-primary"
              placeholder="admin@gmail.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all bg-bg-primary"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-brand to-brand-light hover:from-brand-dark hover:to-brand text-white rounded-xl font-medium shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
