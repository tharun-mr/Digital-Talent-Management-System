import React, { useState } from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const TaskCard = ({ task, onUpdate, onDelete, onComment, isAdmin }) => {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

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
            <span className={`badge ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <p className="text-gray-500">Assigned to:</p>
            <p className="font-medium text-gray-900">{task.assignedTo?.name}</p>
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
            <p className="font-medium text-gray-900 capitalize">{task.category}</p>
          </div>
          <div>
            <p className="text-gray-500">Status:</p>
            <div className="flex items-center space-x-2">
              <span className={getStatusColor(task.status)}>
                {task.status === 'in-progress' ? 'In Progress' : 
                 task.status.charAt(0).toUpperCase() + task.status.slice(1)}
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
                    <p className="font-medium text-gray-900">{comment.user?.name}</p>
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
            {task.status !== 'completed' && (
              <>
                <button
                  onClick={() => handleStatusChange('in-progress')}
                  className="text-sm text-yellow-600 hover:text-yellow-700"
                >
                  Start
                </button>
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Complete
                </button>
              </>
            )}
            {task.status === 'completed' && (
              <span className="text-sm text-green-600 flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Completed
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowComment(!showComment)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Add Comment
            </button>
            {isAdmin && (
              <button
                onClick={() => onDelete(task._id)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Delete
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