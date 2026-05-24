import { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import api from '../api/axios';
import { usePolling } from '../hooks/usePolling';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingUsers: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  // Polling data function
  const fetchDashboardData = async () => {
    try {
      const [usersRes, coursesRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/courses')
      ]);
      
      const users = usersRes.data.users || [];
      const courses = coursesRes.data.courses || [];
      
      setStats({
        totalUsers: users.length,
        totalCourses: courses.length,
        pendingUsers: users.filter(u => !u.approved).length,
        activeUsers: users.filter(u => u.approved).length,
      });

      // Generate real chart data for the last 7 days
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const newChartData = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);

        const usersOnDay = users.filter(u => {
          const date = new Date(u.createdAt || Date.now());
          return date >= d && date < nextD;
        }).length;

        const coursesOnDay = courses.filter(c => {
          const date = new Date(c.createdAt || Date.now());
          return date >= d && date < nextD;
        }).length;

        newChartData.push({
          name: days[d.getDay()],
          users: usersOnDay,
          courses: coursesOnDay
        });
      }
      setChartData(newChartData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  // Poll every 10 seconds
  usePolling(fetchDashboardData, 10000);

  const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass }) => (
    <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_30px_rgba(30,64,175,0.05)] border border-border flex items-center justify-between">
      <div>
        <p className="text-text-secondary text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-text-primary">{loading ? '-' : value}</h3>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${gradientClass} shadow-lg text-white`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard Overview</h1>
          <p className="text-text-secondary mt-1">Real-time statistics from EduConnect</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={Users} 
          gradientClass="bg-gradient-to-br from-brand to-brand-dark" 
        />
        <StatCard 
          title="Total Courses" 
          value={stats.totalCourses} 
          icon={BookOpen} 
          gradientClass="bg-gradient-to-br from-brand-light to-brand" 
        />
        <StatCard 
          title="Pending Approvals" 
          value={stats.pendingUsers} 
          icon={Clock} 
          gradientClass="bg-gradient-to-br from-orange-400 to-orange-600" 
        />
        <StatCard 
          title="Active Users" 
          value={stats.activeUsers} 
          icon={Activity} 
          gradientClass="bg-gradient-to-br from-emerald-400 to-emerald-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_30px_rgba(30,64,175,0.05)] border border-border">
          <h3 className="text-lg font-bold text-text-primary mb-6">Weekly Engagement</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <Tooltip cursor={{fill: '#F8F9FA'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="users" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="courses" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_30px_rgba(30,64,175,0.05)] border border-border">
          <h3 className="text-lg font-bold text-text-primary mb-6">User Growth</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                <Line type="monotone" dataKey="users" stroke="#1E40AF" strokeWidth={3} dot={{r: 4, fill: '#1E40AF', strokeWidth: 2, stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
