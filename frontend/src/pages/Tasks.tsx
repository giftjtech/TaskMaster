import React, { useState, useEffect } from 'react';
import {
  Plus,
  MoreVertical,
  Calendar,
  Tag,
  MessageSquare,
  CheckCircle,
  Clock,
  Search,
  Filter,
  X,
  Eye,
  Edit,
} from 'lucide-react';
import { taskService, Task, CreateTaskDto } from '../services/task.service';
import { projectService, Project } from '../services/project.service';
import { userService, User as UserType } from '../services/user.service';
import { commentService, Comment as CommentType } from '../services/comment.service';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Dropdown } from '../components/ui/Dropdown';
import { Textarea } from '../components/ui/Textarea';
import { DatePicker } from '../components/ui/DatePicker';
import { Button } from '../components/ui/Button';
import { CommentList } from '../components/comments/CommentList';
import { CommentInput } from '../components/comments/CommentInput';
import { TaskDetailsModal } from '../components/tasks/TaskDetailsModal';
import { TagInput } from '../components/tags/TagInput';
import { TagDisplay } from '../components/tags/TagDisplay';
import { useNotifications } from '../hooks/useNotifications';
import { useClickOutside } from '../hooks/useClickOutside';
import { tagService } from '../services/tag.service';
import { Tag as TagType } from '../services/task.service';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { notifications, markAsRead } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [memberFilterOpen, setMemberFilterOpen] = useState(false);
  const [tagFilterOpen, setTagFilterOpen] = useState(false);
  const memberFilterRef = React.useRef<HTMLDivElement>(null);
  const tagFilterRef = React.useRef<HTMLDivElement>(null);
  const taskMenuRef = React.useRef<HTMLDivElement>(null);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [taskMenuOpen, setTaskMenuOpen] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateTaskDto>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    projectId: '',
    assigneeId: '',
    tags: [],
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!user || !token) {
      return;
    }

    const timer = setTimeout(() => {
      loadData();
    }, 100);

    return () => clearTimeout(timer);
  }, [user]);

  useClickOutside(memberFilterRef, () => setMemberFilterOpen(false));
  useClickOutside(tagFilterRef, () => setTagFilterOpen(false));

  // Close task menu when clicking outside
  useEffect(() => {
    if (!taskMenuOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (taskMenuRef.current && !taskMenuRef.current.contains(target)) {
        setTaskMenuOpen(null);
      }
    };
    // Use a small delay to avoid closing immediately when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [taskMenuOpen]);

  useEffect(() => {
    let filtered = tasks;

    // Apply member filter
    if (selectedMemberFilter) {
      filtered = filtered.filter((task) => task.assigneeId === selectedMemberFilter);
    }

    // Apply tag filter
    if (selectedTagFilter) {
      filtered = filtered.filter((task) =>
        task.tags?.some((tag) => tag.id === selectedTagFilter || tag.name === selectedTagFilter)
      );
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.tags?.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredTasks(filtered);
  }, [searchQuery, tasks, selectedMemberFilter, selectedTagFilter]);

  useEffect(() => {
    const newParam = searchParams.get('new');
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search');
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    if (newParam === 'true') {
      setFormData({
        title: '',
        description: '',
        status: (statusParam as Task['status']) || 'todo',
        priority: 'medium',
        dueDate: '',
        projectId: '',
        assigneeId: '',
      });
      setSelectedTask(null);
      setModalOpen(true);
      // Clear search params properly
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('new');
      newParams.delete('status');
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch all tasks with pagination (backend max limit is 100)
      let allTasks: Task[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const tasksResponse = await taskService.getAll({ limit: 100, page });
        
        // Handle paginated response structure
        let tasksList: Task[] = [];
        if (tasksResponse) {
          if (Array.isArray(tasksResponse)) {
            tasksList = tasksResponse;
            hasMore = false; 
          } else if (tasksResponse.data && Array.isArray(tasksResponse.data)) {
            // PaginatedResponseDto structure: { data: Task[], total, page, limit, totalPages }
            tasksList = tasksResponse.data;
            const totalPages = tasksResponse.totalPages || 1;
            hasMore = page < totalPages;
            page++;
          } else if (tasksResponse.success && tasksResponse.data?.data && Array.isArray(tasksResponse.data.data)) {
            // Wrapped response: { success: true, data: { data: Task[], ... } }
            tasksList = tasksResponse.data.data;
            const totalPages = tasksResponse.data.totalPages || 1;
            hasMore = page < totalPages;
            page++;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
        
        allTasks = [...allTasks, ...tasksList];
        
        // Safety check: don't loop forever
        if (page > 100) {
          hasMore = false;
        }
      }
      
      // Fetch projects and users
      const [projectsResponse, usersResponse, tagsResponse] = await Promise.all([
        projectService.getAll(),
        userService.getAll(),
        tagService.getAll().catch(() => []), // Gracefully handle if tags endpoint doesn't exist yet
      ]);
      
      setTasks(allTasks);
      setFilteredTasks(allTasks);

      const projectsList = Array.isArray(projectsResponse?.data)
        ? projectsResponse.data
        : Array.isArray(projectsResponse)
        ? projectsResponse
        : [];
      setProjects(projectsList);

      const usersList = Array.isArray(usersResponse?.data)
        ? usersResponse.data
        : Array.isArray(usersResponse)
        ? usersResponse
        : [];
      const tagsList = Array.isArray(tagsResponse) ? tagsResponse : [];
      setUsers(usersList);
      setAvailableTags(tagsList);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      if (!formData.title.trim()) {
        toast.error('Title is required');
        return;
      }

      const taskData: CreateTaskDto = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        projectId: formData.projectId || undefined,
        assigneeId: formData.assigneeId || undefined,
        tags: selectedTags.map((tag) => tag.name),
      };

      await taskService.create(taskData);
      toast.success('Task created successfully');
      setModalOpen(false);
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        projectId: '',
        assigneeId: '',
      });
      loadData();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    try {
      if (!formData.title.trim()) {
        toast.error('Title is required');
        return;
      }

      const taskData: Partial<CreateTaskDto> = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        projectId: formData.projectId || undefined,
        assigneeId: formData.assigneeId || undefined,
        tags: selectedTags.map((tag) => tag.name),
      };

      await taskService.update(selectedTask.id, taskData);
      toast.success('Task updated successfully');
      setModalOpen(false);
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        projectId: '',
        assigneeId: '',
        tags: [],
      });
      setSelectedTags([]);
      loadData();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleTaskMove = async (taskId: string, newStatus: Task['status']) => {
    try {
      await taskService.update(taskId, { status: newStatus });
      // Show toast for immediate feedback (WebSocket status update toasts are suppressed)
      toast.success('Task moved successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to move task');
    }
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDraggedOverColumn(null);

    if (!draggedTask) return;

    const statusMap: Record<string, Task['status']> = {
      todo: 'todo',
      'in-progress': 'in_progress',
      review: 'in_review',
      done: 'done',
    };

    const newStatus = statusMap[columnId];
    if (newStatus && newStatus !== draggedTask.status) {
      handleTaskMove(draggedTask.id, newStatus);
    }

    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const handleTaskClick = async (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || '',
      projectId: task.projectId || '',
      assigneeId: task.assigneeId || '',
      tags: [],
    });
    setSelectedTags(task.tags || []);
    setModalOpen(true);
    // Load comments for this task
    await loadComments(task.id);
  };

  const handleTaskView = async (task: Task) => {
    setViewTask(task);
    setViewModalOpen(true);
    // Load comments for this task
    await loadComments(task.id);
  };

  // Handle taskId from URL (e.g., from notification click) - opens in view mode
  useEffect(() => {
    const taskIdParam = searchParams.get('taskId');
    if (taskIdParam && !viewModalOpen && !modalOpen) {
      const openTaskById = async () => {
        try {
          const task = await taskService.getById(taskIdParam);
          if (task) {
            // Mark notification as read if it exists and is unread
            const relatedNotification = notifications.find(
              (n) => n.metadata?.taskId === taskIdParam && !n.read
            );
            if (relatedNotification) {
              await markAsRead(relatedNotification.id);
            }
            
            await handleTaskView(task);
            // Remove taskId from URL after opening
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('taskId');
            setSearchParams(newSearchParams);
          }
        } catch (error) {
          toast.error('Task not found');
          // Remove invalid taskId from URL
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete('taskId');
          setSearchParams(newSearchParams);
        }
      };
      openTaskById();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('taskId'), notifications]);

  const loadComments = async (taskId: string) => {
    try {
      setCommentsLoading(true);
      const taskComments = await commentService.getByTaskId(taskId);
      setComments(taskComments || []);
    } catch (error) {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!selectedTask) return;

    try {
      const newComment = await commentService.create({
        content,
        taskId: selectedTask.id,
      });
      setComments([...comments, newComment]);
      toast.success('Comment added successfully');
      
      // Refresh tasks to update comment count
      loadData();
    } catch (error) {
      toast.error('Failed to add comment');
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.delete(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
      toast.success('Comment deleted successfully');
      
      // Refresh tasks to update comment count
      loadData();
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const getPriorityColor = (priority: string) => {
    const isDark = theme === 'dark';
    const colors: Record<string, string> = {
      urgent: isDark 
        ? 'bg-red-900/30 text-red-300 border-red-700' 
        : 'bg-red-100 text-red-600 border-red-300',
      high: isDark 
        ? 'bg-pink-900/30 text-pink-300 border-pink-700' 
        : 'bg-pink-100 text-pink-600 border-pink-300',
      medium: isDark 
        ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700' 
        : 'bg-yellow-100 text-yellow-600 border-yellow-300',
      low: isDark 
        ? 'bg-gray-700 text-gray-300 border-gray-600' 
        : 'bg-gray-100 text-gray-500 border-gray-200',
    };
    return colors[priority] || colors.low;
  };

  const getColumnColor = (color: string) => {
    const isDark = theme === 'dark';
    const colors: Record<string, string> = {
      gray: isDark 
        ? 'bg-gray-800/90 border-2 border-gray-700 dark:border-gray-600 shadow-sm' 
        : 'bg-pink-50/90 border-2 border-pink-300 shadow-sm',
      blue: isDark 
        ? 'bg-gray-800/90 border-2 border-gray-700 dark:border-gray-600 shadow-sm' 
        : 'bg-blue-50/90 border-2 border-blue-300 shadow-sm',
      yellow: isDark 
        ? 'bg-gray-800/90 border-2 border-gray-700 dark:border-gray-600 shadow-sm' 
        : 'bg-yellow-50/90 border-2 border-yellow-300 shadow-sm',
      green: isDark 
        ? 'bg-gray-800/90 border-2 border-gray-700 dark:border-gray-600 shadow-sm' 
        : 'bg-green-50/90 border-2 border-green-300 shadow-sm',
    };
    return colors[color] || colors.gray;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getAllUniqueTags = (): TagType[] => {
    const tagMap = new Map<string, TagType>();
    tasks.forEach((task) => {
      task.tags?.forEach((tag) => {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      });
    });
    return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter((task) => {
      if (status === 'todo') return task.status === 'todo';
      if (status === 'in-progress') return task.status === 'in_progress';
      if (status === 'review') return task.status === 'in_review';
      if (status === 'done') return task.status === 'done';
      return false;
    });
  };

  const getCompletedTodayCount = () => {
    const today = new Date().toDateString();
    return tasks.filter((task) => {
      if (task.status !== 'done') return false;
      const completedDate = new Date(task.updatedAt).toDateString();
      return completedDate === today;
    }).length;
  };

  const getDueTodayCount = () => {
    const today = new Date().toDateString();
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate).toDateString();
      return dueDate === today && task.status !== 'done';
    }).length;
  };

  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      color: 'gray',
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      color: 'blue',
    },
    {
      id: 'review',
      title: 'In Review',
      color: 'yellow',
    },
    {
      id: 'done',
      title: 'Done',
      color: 'green',
    },
  ];

  return (
    <div className="h-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Page Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-pink-100 dark:border-gray-700 shadow-sm px-6 py-4 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">✨ Project Tasks</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track your team's progress</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-1.5 px-3 py-1.5 border border-pink-200 dark:border-gray-600 rounded-lg hover:border-pink-300 dark:hover:border-gray-500 hover:bg-pink-50 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-300">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span>Filter</span>
            </button>
            <button
              onClick={() => {
                setFormData({
                  title: '',
                  description: '',
                  status: 'todo',
                  priority: 'medium',
                  dueDate: '',
                  projectId: '',
                  assigneeId: '',
                });
                setSelectedTask(null);
                setModalOpen(true);
              }}
              className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400 dark:text-pink-500" />
            <input
              type="text"
              placeholder="🔍 Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-sm border border-pink-200 dark:border-gray-600 rounded-lg focus:border-pink-400 dark:focus:border-pink-500 focus:ring-2 focus:ring-pink-100 dark:focus:ring-pink-900 transition outline-none bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-300 dark:text-pink-500 hover:text-pink-500 dark:hover:text-pink-400 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* All Members Filter */}
            <div className="relative" ref={memberFilterRef}>
              <button
                onClick={() => setMemberFilterOpen(!memberFilterOpen)}
                className={`px-3 py-1.5 bg-white/60 dark:bg-gray-700/60 border rounded-lg text-xs font-medium hover:bg-pink-50 dark:hover:bg-gray-600 hover:border-pink-300 dark:hover:border-gray-500 transition text-gray-700 dark:text-gray-300 flex items-center space-x-1 ${
                  selectedMemberFilter ? 'border-pink-400 dark:border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-pink-200 dark:border-gray-600'
                }`}
              >
                <span>All Members</span>
                {selectedMemberFilter && (
                  <X
                    className="w-3 h-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMemberFilter(null);
                      setMemberFilterOpen(false);
                    }}
                  />
                )}
              </button>
              {memberFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-pink-200 dark:border-gray-700 z-[9999] max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedMemberFilter(null);
                        setMemberFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-pink-50 dark:hover:bg-gray-700 transition ${
                        !selectedMemberFilter ? 'bg-pink-100 dark:bg-gray-700 font-medium' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      All Members
                    </button>
                    <div className="border-t border-pink-100 dark:border-gray-700 my-1"></div>
                    {users.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          setSelectedMemberFilter(member.id);
                          setMemberFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-pink-50 dark:hover:bg-gray-700 transition flex items-center space-x-2 ${
                          selectedMemberFilter === member.id
                            ? 'bg-pink-100 dark:bg-gray-700 font-medium'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="w-6 h-6 bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                        <span>
                          {member.firstName} {member.lastName}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* All Tags Filter */}
            <div className="relative" ref={tagFilterRef}>
              <button
                onClick={() => setTagFilterOpen(!tagFilterOpen)}
                className={`px-3 py-1.5 bg-white/60 dark:bg-gray-700/60 border rounded-lg text-xs font-medium hover:bg-pink-50 dark:hover:bg-gray-600 hover:border-pink-300 dark:hover:border-gray-500 transition text-gray-700 dark:text-gray-300 flex items-center space-x-1 ${
                  selectedTagFilter ? 'border-pink-400 dark:border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-pink-200 dark:border-gray-600'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>
                  {selectedTagFilter
                    ? getAllUniqueTags().find((t) => t.id === selectedTagFilter || t.name === selectedTagFilter)?.name || 'Selected Tag'
                    : 'All Tags'}
                </span>
                {selectedTagFilter && (
                  <X
                    className="w-3 h-3 ml-1 text-pink-400 hover:text-pink-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTagFilter(null);
                      setTagFilterOpen(false);
                    }}
                  />
                )}
              </button>
              {tagFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9999] max-h-60 overflow-y-auto">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedTagFilter(null);
                        setTagFilterOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      All Tags
                    </button>
                    {getAllUniqueTags().length > 0 ? (
                      <>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        {getAllUniqueTags().map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => {
                              setSelectedTagFilter(tag.id);
                              setTagFilterOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color || '#ec4899' }}
                            />
                            {tag.name}
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        No tags available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-6 overflow-x-auto h-[calc(100vh-200px)] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-pink-400 dark:border-pink-500 border-t-transparent"></div>
          </div>
        )}
        <div className="flex space-x-4 min-w-max pb-6">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            const isDraggedOver = draggedOverColumn === column.id;
            return (
              <div
                key={column.id}
                className="w-72 flex-shrink-0"
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div
                  className={`${getColumnColor(column.color)} rounded-lg px-3 py-2.5 flex items-center justify-between shadow-md ${
                    isDraggedOver ? 'ring-2 ring-pink-400 dark:ring-pink-500 ring-offset-2' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-white">{column.title}</h3>
                    <span className="bg-white/80 dark:bg-gray-700/80 px-2 py-0.5 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const statusMap: Record<string, Task['status']> = {
                        todo: 'todo',
                        'in-progress': 'in_progress',
                        review: 'in_review',
                        done: 'done',
                      };
                      setFormData({
                        title: '',
                        description: '',
                        status: statusMap[column.id] || 'todo',
                        priority: 'medium',
                        dueDate: '',
                        projectId: '',
                        assigneeId: '',
                      });
                      setSelectedTask(null);
                      setModalOpen(true);
                    }}
                    className="text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 hover:scale-110 transition-transform"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Tasks Container */}
                <div
                  className={`bg-gradient-to-b from-white/40 to-white/20 dark:from-gray-800/40 dark:to-gray-800/20 rounded-lg border-2 border-pink-200/50 dark:border-gray-700/50 p-3 space-y-2.5 min-h-[400px] mt-2 ${
                    isDraggedOver ? 'ring-2 ring-pink-400 dark:ring-pink-500 ring-inset bg-pink-50/30 dark:bg-gray-700/30 border-pink-300 dark:border-gray-600' : ''
                  }`}
                >
                  {columnTasks.map((task) => {
                    const commentsCount = task.comments?.length || 0;
                    const isDragging = draggedTask?.id === task.id;
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-pink-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-gray-600 hover:shadow-lg hover:scale-[1.02] transition-all cursor-move group relative ${
                          isDragging ? 'opacity-40 scale-95 rotate-2' : ''
                        }`}
                      >
                        {/* Task Header */}
                        <div className="flex items-start justify-between mb-2">
                          <span
                            className={`px-1.5 py-0.5 rounded-lg text-[10px] font-semibold border ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          <div className="relative" ref={taskMenuOpen === task.id ? taskMenuRef : null}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTaskMenuOpen(taskMenuOpen === task.id ? null : task.id);
                              }}
                              className="text-pink-300 dark:text-pink-500 hover:text-pink-500 dark:hover:text-pink-400 opacity-0 group-hover:opacity-100 transition"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {taskMenuOpen === task.id && (
                              <div 
                                className="absolute right-0 top-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-pink-200 dark:border-gray-700 py-1 z-10 min-w-[120px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTaskView(task);
                                    setTaskMenuOpen(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTaskClick(task);
                                    setTaskMenuOpen(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Task Title */}
                        <h4 className="font-medium text-sm text-gray-800 dark:text-white mb-2 leading-tight line-clamp-2">{task.title}</h4>

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="mb-2">
                            <TagDisplay tags={task.tags} maxDisplay={3} />
                          </div>
                        )}

                        {/* Task Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-pink-100 dark:border-gray-700">
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(task.dueDate)}</span>
                            </div>
                            {commentsCount > 0 && (
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{commentsCount}</span>
                              </div>
                            )}
                          </div>
                          <div className="w-6 h-6 bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                            {task.assignee
                              ? getInitials(task.assignee.firstName, task.assignee.lastName)
                              : 'U'}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Task Button */}
                  <button
                    onClick={() => {
                      const statusMap: Record<string, Task['status']> = {
                        todo: 'todo',
                        'in-progress': 'in_progress',
                        review: 'in_review',
                        done: 'done',
                      };
                      setFormData({
                        title: '',
                        description: '',
                        status: statusMap[column.id] || 'todo',
                        priority: 'medium',
                        dueDate: '',
                        projectId: '',
                        assigneeId: '',
                      });
                      setSelectedTask(null);
                      setModalOpen(true);
                    }}
                    className="w-full py-2 border-2 border-dashed border-pink-300 dark:border-gray-600 rounded-lg text-pink-500 dark:text-pink-400 hover:border-pink-400 dark:hover:border-pink-500 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-pink-50/50 dark:hover:bg-gray-700/50 transition flex items-center justify-center space-x-1.5 group text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Details Modal Placeholder */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-2">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-xl border border-green-200 dark:border-green-800 flex items-center space-x-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
          <span className="text-xs font-semibold text-gray-800 dark:text-white">
            ✨ {getCompletedTodayCount()} completed today
          </span>
        </div>
        {getDueTodayCount() > 0 && (
          <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white rounded-lg px-3 py-1.5 shadow-xl flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{getDueTodayCount()} due today</span>
          </div>
        )}
      </div>

      {/* Create/Edit Task Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTask(null);
          setComments([]);
          setFormData({
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
            dueDate: '',
            projectId: '',
            assigneeId: '',
          });
        }}
        title={selectedTask ? 'Edit Task' : 'Create New Task'}
        size="lg"
      >
        <div className="flex flex-col h-full">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-3">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="✨ Enter task title"
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="📝 Enter task description"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <Dropdown
                  value={formData.status}
                  onChange={(value) => setFormData({ ...formData, status: value as Task['status'] })}
                  options={[
                    { value: 'todo', label: 'To Do' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'in_review', label: 'In Review' },
                    { value: 'done', label: 'Done' },
                  ]}
                  placeholder="Select status..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <Dropdown
                  value={formData.priority}
                  onChange={(value) => setFormData({ ...formData, priority: value as Task['priority'] })}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                  placeholder="Select priority..."
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <DatePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project
                </label>
                <Dropdown
                  value={formData.projectId || ''}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      projectId: value ? value : undefined,
                    })
                  }
                  options={[
                    { value: '', label: 'No Project' },
                    ...projects.map((project) => ({
                      value: project.id,
                      label: project.name,
                    })),
                  ]}
                  placeholder="Select project..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assignee
                </label>
                <Dropdown
                  value={formData.assigneeId || ''}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      assigneeId: value ? value : undefined,
                    })
                  }
                  options={[
                    { value: '', label: 'Unassigned' },
                    ...users.map((user) => ({
                      value: user.id,
                      label: `${user.firstName} ${user.lastName}`,
                    })),
                  ]}
                  placeholder="Select assignee..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tags
              </label>
              <TagInput
                tags={selectedTags}
                availableTags={availableTags}
                onChange={setSelectedTags}
                placeholder="Add tags..."
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Press enter to add
              </p>
            </div>

            {/* Comments Section - Only show when editing/viewing a task */}
            {selectedTask && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span>Comments</span>
                </h3>
                
                {/* Comment Input */}
                <div className="mb-4">
                  <CommentInput
                    onSubmit={handleAddComment}
                    users={users}
                    currentUserId={user?.id || ''}
                  />
                </div>

                {/* Comments List */}
                {commentsLoading ? (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading comments...</div>
                ) : (
                  <CommentList
                    comments={comments}
                    currentUserId={user?.id || ''}
                    allUsers={users}
                    onDelete={handleDeleteComment}
                  />
                )}
              </div>
            )}
          </div>
          
          {/* Fixed Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 flex gap-3 justify-end sticky bottom-0 z-10">
            <Button
              onClick={selectedTask ? handleUpdateTask : handleCreateTask}
              className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:shadow-lg"
            >
              {selectedTask ? '✨ Update Task' : '✨ Create Task'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setModalOpen(false);
                setSelectedTask(null);
                setFormData({
                  title: '',
                  description: '',
                  status: 'todo',
                  priority: 'medium',
                  dueDate: '',
                  projectId: '',
                  assigneeId: '',
                });
              }}
              className="hover:bg-pink-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Task Details View Modal */}
      <TaskDetailsModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewTask(null);
          setComments([]);
        }}
        task={viewTask}
        projects={projects}
        users={users}
        currentUserId={user?.id || ''}
        comments={comments}
        commentsLoading={commentsLoading}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />
    </div>
  );
};

export default Tasks;
