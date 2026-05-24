import { useState, useEffect } from 'react';
import { BookOpen, UserPlus, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios';
import { usePolling } from '../hooks/usePolling';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // For assignment modals
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalType, setModalType] = useState(null); // 'teacher' or 'student'
  const [selectedUserId, setSelectedUserId] = useState('');

  const fetchData = async () => {
    try {
      const [coursesRes, usersRes] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/users')
      ]);
      setCourses(coursesRes.data.courses || []);
      setUsers((usersRes.data.users || []).filter(u => u.approved));
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  usePolling(fetchData, 10000);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    try {
      const endpoint = modalType === 'teacher' 
        ? `/admin/courses/${selectedCourse._id}/assign-teacher`
        : `/admin/courses/${selectedCourse._id}/assign-students`;
      
      const payload = modalType === 'teacher'
        ? { teacherId: selectedUserId }
        : { studentIds: [selectedUserId] };

      await api.put(endpoint, payload);
      toast.success(`${modalType === 'teacher' ? 'Teacher' : 'Student'} assigned successfully`);
      setModalType(null);
      setSelectedCourse(null);
      setSelectedUserId('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign');
    }
  };

  const openAssignModal = (course, type) => {
    setSelectedCourse(course);
    setModalType(type);
    setSelectedUserId('');
  };

  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Course Management</h1>
          <p className="text-text-secondary mt-1">View courses and manage assignments</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-[20px] shadow-sm border border-border">
          No courses found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-[20px] shadow-[0_4px_30px_rgba(30,64,175,0.05)] border border-border p-6 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-light to-brand text-white flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="bg-brand/10 text-brand text-xs font-semibold px-3 py-1 rounded-full">
                  {course.progress || 0}% avg progress
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-1">{course.name}</h3>
              
              <div className="flex flex-col gap-2 mt-2 mb-6 text-sm text-text-secondary flex-1">
                <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Teacher</span>
                  <span className="font-medium text-text-primary">
                    {course.teacher ? course.teacher.name : <span className="text-orange-500 italic">Unassigned</span>}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="flex items-center gap-2"><UsersIcon className="w-4 h-4" /> Students</span>
                  <span className="font-medium text-text-primary">{course.students?.length || 0} enrolled</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => openAssignModal(course, 'teacher')}
                  className="flex-1 py-2 bg-white border border-brand text-brand hover:bg-brand/5 rounded-xl text-sm font-medium transition-colors"
                >
                  Assign Teacher
                </button>
                <button
                  onClick={() => openAssignModal(course, 'student')}
                  className="flex-1 py-2 bg-brand text-white hover:bg-brand-dark rounded-xl text-sm font-medium transition-colors"
                >
                  Add Student
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-6 border border-border relative overflow-hidden">
            {/* Modal Header */}
            <div className="mb-6 relative z-10">
              <h2 className="text-xl font-bold text-text-primary">
                {modalType === 'teacher' ? 'Assign Teacher' : 'Add Student'}
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                Select a {modalType} for <span className="font-semibold text-text-primary">{selectedCourse?.name}</span>
              </p>
            </div>

            <form onSubmit={handleAssign} className="relative z-10">
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Select {modalType === 'teacher' ? 'Teacher' : 'Student'}
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 text-text-primary"
                  required
                >
                  <option value="" disabled>Choose a {modalType}...</option>
                  {(modalType === 'teacher' ? teachers : students).map(user => (
                    <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedUserId}
                  className="flex-1 py-3 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
