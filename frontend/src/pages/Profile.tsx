import React, { useMemo, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useProfileData } from '../hooks/useProfileData';
import { useUserAchievements } from '../hooks/useUserAchievements';
import { useTaskMetrics } from '../hooks/useTaskMetrics';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import {
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Award,
  Calendar,
  Star,
  Upload,
  Camera,
} from 'lucide-react';
import { formatDate as formatDateUtil } from '../utils/helpers';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { userService } from '../services/user.service';
import toast from 'react-hot-toast';

const formatDate = (dateString?: string | Date) => {
  if (!dateString) return 'No date';
  return formatDateUtil(dateString);
};

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const { assignedTasks, completionRate, loading, error } = useProfileData(user?.id);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { completedTasks, inProgressTasks, overdueTasks, recentCompleted, timeline } = 
    useTaskMetrics(assignedTasks);
  
  const achievements = useUserAchievements(assignedTasks, completedTasks, completionRate);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    // Early return if no file selected (user cancelled dialog)
    if (!file || !file.name) {
      return;
    }

    // Validate file type
    if (!file.type || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (max 5MB)
    if (!file.size || file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          
          // Validate that we got a valid base64 string
          if (!base64String || typeof base64String !== 'string' || !base64String.startsWith('data:image/')) {
            throw new Error('Invalid image data');
          }
          
          // Update user avatar via API
          if (user?.id) {
            await userService.update(user.id, { avatar: base64String });
            
            // Update user in context
            updateUser({ avatar: base64String });
            
            toast.success('Profile picture updated successfully');
          }
        } catch (error: any) {
          console.error('Failed to update avatar:', error);
          toast.error(error?.response?.data?.message || error?.message || 'Failed to update profile picture');
        } finally {
          setUploading(false);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
        setUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Chart configuration for 30-day activity
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const textColorSecondary = isDark ? '#94a3b8' : '#64748b';
  
  const activityChartOptions = useMemo(() => ({
    chart: {
      type: 'bar' as const,
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false },
      sparkline: { enabled: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
        borderRadiusApplication: 'end' as const,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val > 0 ? val.toString() : '',
      offsetY: -20,
      style: {
        fontSize: '10px',
        fontWeight: 600,
        colors: [textColor],
      },
    },
    xaxis: {
      categories: timeline.map((t) => t.date),
      labels: {
        style: {
          fontSize: '10px',
          colors: textColorSecondary,
        },
        rotate: -45,
        rotateAlways: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '10px',
          colors: textColorSecondary,
        },
      },
      title: {
        text: 'Tasks Completed',
        style: {
          fontSize: '11px',
          fontWeight: 500,
          color: textColorSecondary,
        },
      },
    },
    colors: ['#3b82f6'],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: ['#8b5cf6'],
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.3,
        stops: [0, 100],
      },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      style: {
        fontSize: '11px',
      },
      y: {
        formatter: (val: number) => `${val} task${val !== 1 ? 's' : ''} completed`,
      },
    },
    grid: {
      borderColor: isDark ? '#374151' : '#e2e8f0',
      strokeDashArray: 0,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  }), [timeline, theme]);

  const activityChartSeries = useMemo(() => [
    {
      name: 'Completed Tasks',
      data: timeline.map((t) => t.count),
    },
  ], [timeline]);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    const isDark = theme === 'dark';
    const statusMap: Record<string, string> = {
      done: isDark 
        ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700' 
        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      in_progress: isDark 
        ? 'bg-blue-900/30 text-blue-300 border-blue-700' 
        : 'bg-blue-50 text-blue-700 border-blue-200',
      in_review: isDark 
        ? 'bg-amber-900/30 text-amber-300 border-amber-700' 
        : 'bg-amber-50 text-amber-700 border-amber-200',
      todo: isDark 
        ? 'bg-slate-700 text-slate-300 border-slate-600' 
        : 'bg-slate-50 text-slate-700 border-slate-200',
      overdue: isDark 
        ? 'bg-rose-900/30 text-rose-300 border-rose-700' 
        : 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return statusMap[status] || statusMap.todo;
  };

  const getPriorityColor = (priority: string) => {
    const isDark = theme === 'dark';
    const priorityMap: Record<string, string> = {
      urgent: isDark 
        ? 'bg-rose-900/30 text-rose-300 border-rose-700' 
        : 'bg-rose-50 text-rose-700 border-rose-200',
      high: isDark 
        ? 'bg-orange-900/30 text-orange-300 border-orange-700' 
        : 'bg-orange-50 text-orange-700 border-orange-200',
      medium: isDark 
        ? 'bg-amber-900/30 text-amber-300 border-amber-700' 
        : 'bg-amber-50 text-amber-700 border-amber-200',
      low: isDark 
        ? 'bg-slate-700 text-slate-300 border-slate-600' 
        : 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return priorityMap[priority] || priorityMap.low;
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (error && assignedTasks.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 mb-4">Failed to load profile data</div>
          <p className="text-sm text-slate-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-0.5">Profile</h1>
              <p className="text-xs text-slate-600 dark:text-gray-400">Your profile and task history</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
          </div>
        )}
        {/* User Info Card */}
        <Card className="border-2 border-slate-200 shadow-sm shadow-sm bg-blue-50 dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div 
                  onClick={handleAvatarClick}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-blue-400 dark:hover:ring-blue-500 relative"
                  style={{
                    background: user?.avatar 
                      ? 'transparent' 
                      : 'linear-gradient(to bottom right, #3b82f6, #9333ea)'
                  }}
                >
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(user?.firstName, user?.lastName)
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer" onClick={handleAvatarClick}>
                  <Camera className="w-5 h-5 text-white" />
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm text-slate-600 dark:text-gray-400">{user?.email}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 capitalize">{user?.role || 'User'}</p>
                <button
                  onClick={handleAvatarClick}
                  disabled={uploading}
                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-3 h-3" />
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </button>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">Completion Rate</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completionRate}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 border-slate-200 shadow-sm shadow-sm bg-blue-50 dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Assigned Tasks</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{assignedTasks.length}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-lg">
                  <Target className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 shadow-sm shadow-sm bg-blue-50 dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Completed</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedTasks.length}</p>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 shadow-sm shadow-sm bg-blue-50 dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">In Progress</p>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{inProgressTasks.length}</p>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2.5 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 shadow-sm shadow-sm bg-blue-50 dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Overdue</p>
                  <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{overdueTasks.length}</p>
                </div>
                <div className="bg-rose-100 dark:bg-rose-900/30 p-2.5 rounded-lg">
                  <Calendar className="h-5 w-5 text-rose-500 dark:text-rose-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Achievements */}
          <Card className="border-2 border-slate-200 shadow-sm shadow-sm bg-blue-50 dark:bg-gray-800">
            <CardHeader className="border-b border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Achievements</CardTitle>
              </div>
              <CardDescription className="text-slate-600 dark:text-gray-400">Your success milestones</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  const isDark = theme === 'dark';
                  const borderColorMap: Record<string, { light: string; dark: string }> = {
                    'text-yellow-500': { light: 'border-yellow-200', dark: 'border-yellow-700' },
                    'text-blue-500': { light: 'border-blue-200', dark: 'border-blue-700' },
                    'text-purple-500': { light: 'border-purple-200', dark: 'border-purple-700' },
                    'text-green-500': { light: 'border-green-200', dark: 'border-green-700' },
                  };
                  const borderColor = borderColorMap[achievement.color] 
                    ? (isDark ? borderColorMap[achievement.color].dark : borderColorMap[achievement.color].light)
                    : (isDark ? 'border-slate-600' : 'border-slate-200');
                  return (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-lg border-2 ${
                        achievement.unlocked
                          ? `${achievement.bgColor} ${borderColor}`
                          : isDark 
                            ? 'bg-slate-700 border-slate-600 opacity-60' 
                            : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon
                          className={`h-4 w-4 ${
                            achievement.unlocked ? achievement.color : (isDark ? 'text-slate-500' : 'text-slate-400')
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            achievement.unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400'
                          }`}
                        >
                          {achievement.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-gray-400">{achievement.description}</p>
                      {achievement.unlocked && (
                        <div className="mt-1.5 flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 dark:text-yellow-400" />
                          <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-medium">Unlocked</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Completion Timeline */}
          <Card className="border-2 border-slate-200 shadow-sm shadow-sm bg-blue-50 dark:bg-gray-800">
            <CardHeader className="border-b border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">30-Day Activity</CardTitle>
              </div>
              <CardDescription className="text-slate-600 dark:text-gray-400">Task completion timeline</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {timeline.some((t) => t.count > 0) ? (
                <Chart
                  options={activityChartOptions}
                  series={activityChartSeries}
                  type="bar"
                  height={240}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-60 text-center">
                  <TrendingUp className="h-12 w-12 text-slate-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">No activity yet</p>
                  <p className="text-xs text-slate-400 dark:text-gray-500">Complete tasks to see your activity timeline</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Completed Tasks */}
        {recentCompleted.length > 0 && (
          <Card className="border-2 border-slate-200 shadow-sm shadow-sm bg-blue-50 dark:bg-gray-800">
            <CardHeader className="border-b border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Recent Successes</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-gray-400">Your recently completed tasks</CardDescription>
                </div>
                <Link
                  to="/tasks"
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {recentCompleted.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-lg p-3 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">{task.title}</h3>
                        </div>
                        {task.project && (
                          <p className="text-xs text-slate-600 dark:text-gray-400 ml-6">Project: {task.project.name}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 ml-6">
                          <span className="text-[10px] text-slate-500 dark:text-gray-400">
                            Completed {formatDate(task.updatedAt || task.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Tasks */}
        <Card className="border-2 border-slate-200 shadow-sm shadow-sm bg-blue-50 dark:bg-gray-800">
          <CardHeader className="border-b border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">My Tasks</CardTitle>
                <CardDescription className="text-slate-600 dark:text-gray-400">All tasks assigned to you</CardDescription>
              </div>
              <Link
                to="/tasks"
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {assignedTasks.length > 0 ? (
              <div className="space-y-2">
                {assignedTasks.slice(0, 10).map((task) => (
                  <div
                    key={task.id}
                    className="border border-slate-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-all bg-white dark:bg-gray-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1.5 truncate">{task.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {formatStatus(task.status)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                          {task.project && (
                            <span className="text-[10px] text-slate-600 dark:text-gray-400">
                              {task.project.name}
                            </span>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center text-[10px] text-slate-600 dark:text-gray-400">
                              <Calendar className="w-3 h-3 mr-0.5" />
                              {formatDate(task.dueDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {assignedTasks.length > 10 && (
                  <div className="text-center pt-2">
                    <Link
                      to="/tasks"
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      View {assignedTasks.length - 10} more tasks →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-gray-400">No tasks assigned yet</p>
                <Link
                  to="/tasks"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 inline-block"
                >
                  Browse available tasks
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
