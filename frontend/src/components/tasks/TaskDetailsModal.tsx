import React from 'react';
import { Modal } from '../ui/Modal';
import { Task } from '../../services/task.service';
import { Project } from '../../services/project.service';
import { User } from '../../services/user.service';
import { CommentList } from '../comments/CommentList';
import { CommentInput } from '../comments/CommentInput';
import { TagDisplay } from '../tags/TagDisplay';
import {
  Calendar,
  Tag as TagIcon,
  User as UserIcon,
  Folder,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  projects: Project[];
  users: User[];
  currentUserId: string;
  comments: any[];
  commentsLoading: boolean;
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'todo':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'in_review':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'done':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'urgent':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'done':
      return <CheckCircle className="w-4 h-4" />;
    case 'in_progress':
      return <TrendingUp className="w-4 h-4" />;
    case 'in_review':
      return <Clock className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task,
  projects,
  users,
  currentUserId,
  comments,
  commentsLoading,
  onAddComment,
  onDeleteComment,
}) => {
  if (!task) return null;

  const project = task.project || projects.find((p) => p.id === task.projectId);
  const assignee = task.assignee || users.find((u) => u.id === task.assigneeId);
  const creator = task.createdBy || (task.assigneeId ? users.find((u) => u.id === task.assigneeId) : null);

  const statusLabel = task.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const priorityLabel = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details" size="lg">
      <div className="flex flex-col h-full">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-6">
          {/* Task Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {task.title}
            </h2>
            {task.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Task Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
              </div>
              <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
                <span>{statusLabel}</span>
              </div>
            </div>

            {/* Priority */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</span>
              </div>
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                {priorityLabel}
              </div>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium">
                  {formatDate(task.dueDate)}
                </p>
              </div>
            )}

            {/* Project */}
            {project && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Folder className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Project</span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium">
                  {project.name}
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <TagIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</span>
              </div>
              <TagDisplay tags={task.tags} />
            </div>
          )}

          {/* Assignee and Creator */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-4 border border-pink-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <UserIcon className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned To</span>
              </div>
              {assignee ? (
                <div className="flex items-center space-x-2">
                  {assignee.avatar ? (
                    <img
                      src={assignee.avatar}
                      alt={`${assignee.firstName} ${assignee.lastName}`}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm font-medium">
                      {assignee.firstName[0]}{assignee.lastName[0]}
                    </div>
                  )}
                  <p className="text-gray-900 dark:text-white font-medium">
                    {assignee.firstName} {assignee.lastName}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">Unassigned</p>
              )}
            </div>

            {/* Creator */}
            {creator && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</span>
                </div>
                <div className="flex items-center space-x-2">
                  {(creator as any).avatar ? (
                    <img
                      src={(creator as any).avatar}
                      alt={`${creator.firstName} ${creator.lastName}`}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm font-medium">
                      {creator.firstName[0]}{creator.lastName[0]}
                    </div>
                  )}
                  <p className="text-gray-900 dark:text-white font-medium">
                    {creator.firstName} {creator.lastName}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Created: {formatDate(task.createdAt)}</span>
            </div>
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Updated: {formatDate(task.updatedAt)}</span>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h3>
            </div>

            {/* Comment Input */}
            <div className="mb-4">
              <CommentInput
                onSubmit={onAddComment}
                users={users}
                currentUserId={currentUserId}
              />
            </div>

            {/* Comments List */}
            {commentsLoading ? (
              <div className="text-center py-4 text-gray-500">Loading comments...</div>
            ) : comments.length > 0 ? (
              <CommentList
                comments={comments}
                currentUserId={currentUserId}
                allUsers={users}
                onDelete={onDeleteComment}
              />
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer - Only Close Button */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 flex justify-end sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

