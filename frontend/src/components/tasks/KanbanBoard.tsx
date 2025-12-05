import React, { useState } from 'react';
import { Task } from '../../services/task.service';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Plus, MoreVertical, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { cn } from '../../utils/helpers';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskMove?: (taskId: string, newStatus: Task['status']) => void;
  onCreateTask?: () => void;
}

const statusColumns = [
  { id: 'todo' as const, label: 'To Do', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'in_progress' as const, label: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/20' },
  { id: 'in_review' as const, label: 'In Review', color: 'bg-yellow-100 dark:bg-yellow-900/20' },
  { id: 'done' as const, label: 'Done', color: 'bg-green-100 dark:bg-green-900/20' },
];

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskClick,
  onTaskMove,
  onCreateTask,
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    if (draggedTask && onTaskMove) {
      onTaskMove(draggedTask.id, status);
    }
    setDraggedTask(null);
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full">
      {statusColumns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={cn('rounded-lg p-4 min-h-[600px]', column.color)}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {column.label}
                  </h3>
                  <Badge variant="default" size="sm">
                    {columnTasks.length}
                  </Badge>
                </div>
                {column.id === 'todo' && onCreateTask && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onCreateTask}
                    className="h-6 w-6 p-0"
                  >
                    <Plus size={16} />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                    onClick={() => onTaskClick?.(task)}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                          {task.title}
                        </h4>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical size={16} />
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'h-2 w-2 rounded-full',
                              priorityColors[task.priority]
                            )}
                          />
                          <span className="text-xs text-gray-500 capitalize">
                            {task.priority}
                          </span>
                        </div>

                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
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
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {task.assignee.firstName} {task.assignee.lastName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

