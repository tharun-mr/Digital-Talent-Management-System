import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TaskContext';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  BriefcaseIcon,
  UserCircleIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ChevronRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, stats, loading } = useTasks();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isAdmin = user?.role === 'admin';

  // Get real stats from the API
  const getStats = () => {
    if (stats) {
      return [
        { 
          title: 'Total Tasks', 
          value: stats.total || 0, 
          icon: BriefcaseIcon, 
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
          changeType: 'increase'
        },
        { 
          title: 'Completed', 
          value: stats.completed || 0, 
          icon: CheckCircleIcon, 
          color: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50',
          textColor: 'text-green-600',
          changeType: 'increase'
        },
        { 
          title: 'In Progress', 
          value: stats['in-progress'] || 0, 
          icon: ClockIcon, 
          color: 'from-yellow-500 to-yellow-600',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-600',
          changeType: 'increase'
        },
        { 
          title: 'Pending', 
          value: stats.pending || 0, 
          icon: ExclamationCircleIcon, 
          color: 'from-red-500 to-red-600',
          bgColor: 'bg-red-50',
          textColor: 'text-red-600',
          changeType: 'decrease'
        },
      ];
    }
    return [];
  };

  // Get recent tasks (last 5)
  const getRecentTasks = () => {
    return tasks.slice(0, 5);
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <span className="badge-success">Completed</span>;
      case 'in-progress':
        return <span className="badge-warning">In Progress</span>;
      default:
        return <span className="badge-danger">Pending</span>;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const statsData = getStats();
  const recentTasks = getRecentTasks();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-slide-down">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {greeting}, <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">{user?.name}</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your tasks today.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              {isAdmin && (
                <Link
                  to="/tasks"
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all duration-300"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>New Task</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  } bg-${stat.changeType === 'increase' ? 'green' : 'red'}-50 px-2 py-1 rounded-full`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Tasks - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 animate-slide-up">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <BriefcaseIcon className="h-6 w-6 text-primary-600 mr-2" />
                    Recent Tasks
                  </h2>
                  <Link to="/tasks" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                    View All
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              
              {recentTasks.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                  <p className="text-gray-600">
                    {isAdmin 
                      ? 'Create your first task to get started'
                      : 'You have no tasks assigned yet. Check back later!'}
                  </p>
                  {isAdmin && (
                    <Link
                      to="/tasks"
                      className="inline-block mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Create Task
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentTasks.map((task, index) => (
                    <div 
                      key={task._id} 
                      className="p-5 hover:bg-gray-50 transition-colors duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`w-2 h-2 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500' : 
                            task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">{task.title}</h3>
                              <span className={`badge ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-sm text-gray-500 capitalize">{task.category}</p>
                              <p className="text-sm text-gray-500">Due: {formatDate(task.dueDate)}</p>
                              {isAdmin && (
                                <p className="text-sm text-gray-500">
                                  Assigned to: {task.assignedTo?.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(task.status)}
                          <Link
                            to={`/tasks/${task._id}`}
                            className="text-gray-400 hover:text-primary-600 transition-colors duration-200"
                          >
                            <ChevronRightIcon className="h-5 w-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 animate-slide-up">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{user?.name}</h3>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                    <span className={`badge ${user?.role === 'admin' ? 'badge-success' : 'badge-primary'} mt-1`}>
                      {user?.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Member since</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Tasks completed</span>
                    <span className="text-sm font-medium text-gray-900">
                      {stats?.completed || 0}/{stats?.total || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Completion rate</span>
                    <span className="text-sm font-medium text-green-600">
                      {stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            {stats && stats.total > 0 && (
              <div className="bg-gradient-to-r from-primary-500 to-secondary-600 rounded-xl shadow-md p-6 text-white animate-slide-up animation-delay-200">
                <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Task Completion</span>
                    <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm mt-4">
                    <span>In Progress</span>
                    <span>{stats['in-progress'] || 0} tasks</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${((stats['in-progress'] || 0) / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats Card */}
            {stats && stats.pending > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 animate-slide-up animation-delay-500">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 text-red-500 mr-2" />
                  Pending Tasks
                </h3>
                <p className="text-3xl font-bold text-red-600">{stats.pending}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Tasks awaiting completion
                </p>
                <Link
                  to="/tasks"
                  className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all pending tasks
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 animate-slide-up">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ArrowTrendingUpIcon className="h-6 w-6 text-primary-600 mr-2" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/tasks"
                className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-all duration-300 group"
              >
                <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <PlusIcon className="h-5 w-5 text-primary-600" />
                </div>
                <span className="font-medium text-gray-700">
                  {isAdmin ? 'Create New Task' : 'View Tasks'}
                </span>
              </Link>
              <button className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-all duration-300 group">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <span className="font-medium text-gray-700">Mark Tasks Complete</span>
              </button>
              <Link
                to="/profile"
                className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-all duration-300 group"
              >
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <UserCircleIcon className="h-5 w-5 text-purple-600" />
                </div>
                <span className="font-medium text-gray-700">Edit Profile</span>
              </Link>
              <Link
                to="/analytics"
                className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-all duration-300 group"
              >
                <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <ChartBarIcon className="h-5 w-5 text-yellow-600" />
                </div>
                <span className="font-medium text-gray-700">View Analytics</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;