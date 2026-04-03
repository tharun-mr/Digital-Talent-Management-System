// frontend/src/contexts/TaskContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addCommentToTask
} from '../services/taskService';

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
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTask = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTask(id);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch task');
      console.error('Error fetching task:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createNewTask = async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      const newTask = await createTask(taskData);
      setTasks(prevTasks => [newTask, ...prevTasks]);
      return newTask;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
      console.error('Error creating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExistingTask = async (id, taskData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await updateTask(id, taskData);
      setTasks(prevTasks =>
        prevTasks.map(task => task._id === id ? updatedTask : task)
      );
      return updatedTask;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
      console.error('Error updating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatusOnly = async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await updateTaskStatus(id, status);
      setTasks(prevTasks =>
        prevTasks.map(task => task._id === id ? updatedTask : task)
      );
      return updatedTask;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
      console.error('Error updating task status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExistingTask = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTask(id);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
      console.error('Error deleting task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ADD COMMENT
  const addComment = async (taskId, comment) => {
    setError(null);
    try {
      const updatedTask = await addCommentToTask(taskId, comment);
      setTasks(prevTasks =>
        prevTasks.map(task => task._id === taskId ? updatedTask : task)
      );
      return updatedTask;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const rejected = tasks.filter(t => t.status === 'rejected').length;
    return {
      total, completed, inProgress, pending, rejected,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0
    };
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const value = {
    tasks,
    loading,
    error,
    fetchTasks,
    fetchTask,
    createNewTask,
    updateExistingTask,
    updateTaskStatusOnly,
    deleteExistingTask,
    addComment,
    getTasksByStatus,
    getStats
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
