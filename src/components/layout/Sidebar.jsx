import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, MessageSquare, LogOut, Settings } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const Sidebar = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Content', path: '/content', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-brand-dark text-white flex flex-col fixed inset-y-0 left-0 z-50">
      <div className="h-16 flex items-center justify-center border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-light to-white bg-clip-text text-transparent">
          EduConnect Admin
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-brand/80 text-white shadow-lg shadow-brand/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
