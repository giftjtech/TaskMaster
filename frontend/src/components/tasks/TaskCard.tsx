import React from 'react';
import { Task } from '../../services/task.service';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Calendar } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { cn } from '../../utils/helpers';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-lg transition-shadow',
        onClick && 'hover:border-primary-500'
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
            {task.title}
          </h3>
          <Badge
            variant={
              task.status === 'done'
                ? 'success'
                : task.status === 'in_progress'
                ? 'primary'
                : task.status === 'in_review'
                ? 'warning'
                : 'default'
            }
            size="sm"
          >
            {task.status.replace('_', ' ')}
          </Badge>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div
              className={cn('h-2 w-2 rounded-full', priorityColors[task.priority])}
            />
            <span className="capitalize">{task.priority}</span>
          </div>

          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(task.dueDate)}
            </div>
          )}
        </div>

        {task.assignee && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="h-6 w-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
              {task.assignee.firstName[0]}
              {task.assignee.lastName[0]}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {task.assignee.firstName} {task.assignee.lastName}
            </span>
          </div>
        )}

        {task.project && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500">Project: {task.project.name}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

