import React, { useState } from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, ChatBubbleLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const TaskCard = ({ task, onUpdate, onDelete, onComment, onEdit, isAdmin, currentUserId }) => {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    category: task.category,
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    assignedTo: task.assignedTo?._id || task.assignedTo
  });

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-red-600',
      'in-progress': 'text-yellow-600',
      completed: 'text-green-600',
      rejected: 'text-gray-600'
    };
    return colors[status] || colors.pending;
  };

  const handleStatusChange = async (newStatus) => {
    await onUpdate(task._id, { status: newStatus });
  };

  const handleAddComment = async () => {
    if (comment.trim()) {
      await onComment(task._id, comment);
      setComment('');
      setShowComment(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await onEdit(task._id, editFormData);
    setIsEditing(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (date) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  // Check if the current user is the assigned user
  const isAssignedUser = currentUserId && task.assignedTo && 
    (task.assignedTo._id === currentUserId || task.assignedTo === currentUserId);
  
  // Status change buttons should ONLY show for assigned users who are NOT admin
  const showStatusButtons = !isAdmin && isAssignedUser && task.status !== 'completed' && task.status !== 'rejected';
  
  // Edit button should ONLY show for admin
  const showEditButton = isAdmin;
  
  // Delete button should ONLY show for admin
  const showDeleteButton = isAdmin;

  // Edit Form - Only admin sees this
  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-md p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Task</h3>
        <form onSubmit={handleEditSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <select
                  name="priority"
                  value={editFormData.priority}
                  onChange={handleEditChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="development">Development</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={editFormData.dueDate}
                onChange={handleEditChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // Normal View
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h3>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>
          <div className="flex space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <p className="text-gray-500">Assigned to:</p>
            <p className="font-medium text-gray-900">{task.assignedTo?.name || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-gray-500">Due Date:</p>
            <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDate(task.dueDate)}
              {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Category:</p>
            <p className="font-medium text-gray-900 capitalize">{task.category || 'Uncategorized'}</p>
          </div>
          <div>
            <p className="text-gray-500">Status:</p>
            <div className="flex items-center space-x-2">
              <span className={getStatusColor(task.status)}>
                {task.status === 'in-progress' ? 'In Progress' : 
                 task.status?.charAt(0).toUpperCase() + task.status?.slice(1) || 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {task.comments?.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowComment(!showComment)}
              className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
            >
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>{task.comments.length} comments</span>
            </button>
            {showComment && (
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {task.comments.map((comment, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-2 text-sm">
                    <p className="font-medium text-gray-900">{comment.user?.name || 'Unknown'}</p>
                    <p className="text-gray-600">{comment.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex space-x-2">
            {/* Status change buttons - ONLY for assigned users who are NOT admin */}
            {showStatusButtons && (
              <>
                {task.status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange('in-progress')}
                    className="px-3 py-1.5 text-sm font-medium text-yellow-700 hover:text-yellow-800 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    Start Task
                  </button>
                )}
                {task.status === 'in-progress' && (
                  <button
                    onClick={() => handleStatusChange('completed')}
                    className="px-3 py-1.5 text-sm font-medium text-green-700 hover:text-green-800 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
              </>
            )}
            
            {/* Show status badge for completed/rejected tasks */}
            {task.status === 'completed' && (
              <span className="text-sm text-green-600 flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Completed
              </span>
            )}
            {task.status === 'rejected' && (
              <span className="text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                Rejected
              </span>
            )}
            
            {/* Show message for admin when task is pending/in-progress */}
            {isAdmin && task.status !== 'completed' && task.status !== 'rejected' && (
              <span className="text-xs text-gray-500">
                Only assigned user can update status
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowComment(!showComment)}
              className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors flex items-center space-x-1"
            >
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>Comment</span>
            </button>
            
            {/* Edit Button - Only for Admin */}
            {showEditButton && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-1"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit Task</span>
              </button>
            )}
            
            {/* Delete Button - Only for Admin */}
            {showDeleteButton && (
              <button
                onClick={() => onDelete(task._id)}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-1"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Comment Input */}
        {showComment && (
          <div className="mt-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              rows="2"
            />
            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={() => setShowComment(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;