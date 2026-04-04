import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TaskContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, loading, fetchTasks, updateTaskStatusOnly } = useTasks();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchTasks();
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0;

  const statusData = [
    { name: 'Completed', value: completedTasks, color: '#10B981' },
    { name: 'In Progress', value: inProgressTasks, color: '#F59E0B' },
    { name: 'Pending', value: pendingTasks, color: '#EF4444' }
  ];

  const recentTasks = tasks.slice(0, 5);

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTaskStatusOnly(taskId, newStatus);
    fetchTasks();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Talent Management</h1>
        <p className="text-gray-600 mt-2">
          Good afternoon, {user?.name || (isAdmin ? 'Admin' : 'User')}! Here's what's happening with your tasks today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Tasks</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{totalTasks}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{completedTasks}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">In Progress</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{inProgressTasks}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{pendingTasks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Tasks</h2>
          </div>

          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task._id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{task.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{task.description}</p>
                    <p className="text-gray-500 text-xs">Category: {task.category}</p>
                    <p className="text-gray-500 text-xs">Assigned to: {task.assignedTo?.name || 'Unassigned'}</p>
                    <p className="text-gray-500 text-xs">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {recentTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No tasks yet.
            </div>
          )}

          <div className="mt-4 text-right">
            <button className="text-blue-600 hover:text-blue-800">View All &gt;</button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">{user?.name || 'User'}</h3>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <p className="text-gray-400 text-xs mt-1">{user?.role}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="border-t pt-3">
              <p className="text-gray-600 text-sm">Member since</p>
              <p className="font-medium">April 2026</p>
              <p className="text-gray-600 text-sm mt-2">Tasks completed</p>
              <p className="font-medium">{completedTasks}/{totalTasks}</p>
              <p className="text-gray-600 text-sm mt-2">Completion rate</p>
              <p className="font-medium text-green-600">{completionRate}%</p>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Overall Progress</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Task Completion</span>
                <span className="font-semibold">{completionRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>In Progress</span>
                <span className="font-semibold">{inProgressTasks} tasks</span>
              </div>
            </div>
          </div>

          {/* Pending Tasks Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-800">Pending Tasks</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{pendingTasks}</p>
            <p className="text-gray-500 text-sm">Tasks awaiting completion</p>
            <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm">
              View all pending tasks &gt;
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                Mark Tasks Complete
              </button>
              <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                Edit Profile
              </button>
              <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;