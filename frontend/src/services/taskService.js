import api from './api';

export const taskAPI = {
  // Get all tasks
  getTasks: () => api.get('/tasks'),
  
  // Get single task
  getTask: (id) => api.get(`/tasks/${id}`),
  
  // Create task (admin only)
  createTask: (taskData) => api.post('/tasks', taskData),
  
  // Update task
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  
  // Delete task (admin only)
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  
  // Add comment
  addComment: (id, comment) => api.post(`/tasks/${id}/comments`, { comment }),
  
  // Get tasks by status
  getTasksByStatus: (status) => api.get(`/tasks/status/${status}`),
  
  // Get task statistics
  getTaskStats: () => api.get('/tasks/stats/overview')
};