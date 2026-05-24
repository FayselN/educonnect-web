import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { logout } from './store/authSlice';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Courses from './pages/Courses';
import ContentModeration from './pages/ContentModeration';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logout());
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [dispatch]);

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="courses" element={<Courses />} />
          <Route path="content" element={<ContentModeration />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
