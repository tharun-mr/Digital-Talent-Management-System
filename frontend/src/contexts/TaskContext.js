import React, { createContext, useState, useContext, useEffect } from 'react';
import { taskAPI } from '../services/taskService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const TaskContext = createContext();

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTasks();
      loadStats();
    }
  }, [user]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const { data } = await taskAPI.getTasks();
      setTasks(data.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await taskAPI.getTaskStats();
      setStats(data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const createTask = async (taskData) => {
    try {
      const { data } = await taskAPI.createTask(taskData);
      setTasks([data.data, ...tasks]);
      toast.success('Task created successfully!');
      loadStats();
      return { success: true, data: data.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create task';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const { data } = await taskAPI.updateTask(id, taskData);
      setTasks(tasks.map(task => task._id === id ? data.data : task));
      toast.success('Task updated successfully!');
      loadStats();
      return { success: true, data: data.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update task';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskAPI.deleteTask(id);
      setTasks(tasks.filter(task => task._id !== id));
      toast.success('Task deleted successfully!');
      loadStats();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete task';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const addComment = async (id, comment) => {
    try {
      const { data } = await taskAPI.addComment(id, comment);
      setTasks(tasks.map(task => task._id === id ? data.data : task));
      toast.success('Comment added!');
      return { success: true, data: data.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add comment';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const getTasksByStatus = async (status) => {
    try {
      const { data } = await taskAPI.getTasksByStatus(status);
      return data.data;
    } catch (error) {
      console.error('Error loading tasks by status:', error);
      return [];
    }
  };

  const value = {
    tasks,
    loading,
    stats,
    createTask,
    updateTask,
    deleteTask,
    addComment,
    getTasksByStatus,
    refreshTasks: loadTasks,
    refreshStats: loadStats
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};