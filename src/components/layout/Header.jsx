import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-text-primary">Welcome back, {user?.name || 'Admin'}</h2>
      </div>
      
      <div className="flex items-center gap-6">
        <button className="text-text-secondary hover:text-brand transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="relative border-l border-border pl-6" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-brand-light/10 text-brand flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-text-primary">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-text-secondary capitalize">{user?.role || 'admin'}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-border py-1 z-50">
              <div className="px-4 py-2 border-b border-border md:hidden">
                <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                <p className="text-xs text-text-secondary capitalize">{user?.role}</p>
              </div>
              <Link 
                to="/profile" 
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Manage Account
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
