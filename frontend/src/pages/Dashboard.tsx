import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Activity,
  Folder,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { taskService, Task } from '../services/task.service';
import { analyticsService } from '../services/analytics.service';
import { projectService, Project } from '../services/project.service';
import Chart from 'react-apexcharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [priorityStats, setPriorityStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!user || !token) {
      return;
    }

    const timer = setTimeout(() => {
      const loadData = async () => {
        try {
          setLoading(true);
          
          let allTasksList: Task[] = [];
          let page = 1;
          let hasMore = true;
          
          while (hasMore && page <= 10) {
            const tasksResponse = await taskService.getAll({ limit: 100, page });
            let tasksList: Task[] = [];
            if (tasksResponse) {
              if (Array.isArray(tasksResponse)) {
                tasksList = tasksResponse;
                hasMore = false;
              } else if (tasksResponse.data && Array.isArray(tasksResponse.data)) {
                tasksList = tasksResponse.data;
                const totalPages = tasksResponse.totalPages || 1;
                hasMore = page < totalPages;
                page++;
              } else {
                hasMore = false;
              }
            } else {
              hasMore = false;
            }
            allTasksList = [...allTasksList, ...tasksList];
          }
          
          const [statsData, tasksData, projectsData, priorityData] = await Promise.all([
            analyticsService.getTaskStats().catch(() => {
              return { total: 0, todo: 0, inProgress: 0, inReview: 0, done: 0, overdue: 0 };
            }),
            taskService.getAll({ limit: 5 }).catch(() => {
              return { data: [] };
            }),
            projectService.getAll().catch(() => {
              return { data: [] };
            }),
            analyticsService.getTasksByPriority().catch(() => {
              return { low: 0, medium: 0, high: 0, urgent: 0 };
            }),
          ]);

          setStats(statsData || { total: 0, todo: 0, inProgress: 0, inReview: 0, done: 0, overdue: 0 });
          setPriorityStats(priorityData || { low: 0, medium: 0, high: 0, urgent: 0 });
          setAllTasks(allTasksList);
          setError(null);
          
          const tasks = Array.isArray(tasksData?.data) ? tasksData.data : Array.isArray(tasksData) ? tasksData : [];
          setRecentTasks(tasks);
          
          const projectsList = Array.isArray(projectsData?.data) ? projectsData.data : Array.isArray(projectsData) ? projectsData : [];
          setProjects(projectsList.slice(0, 3));
        } catch (error: any) {
          setError(error?.message || 'Failed to load dashboard data');
          setStats({ total: 0, todo: 0, inProgress: 0, inReview: 0, done: 0, overdue: 0 });
          setPriorityStats({ low: 0, medium: 0, high: 0, urgent: 0 });
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, 100);

    return () => clearTimeout(timer);
  }, [user]);

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
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const calculateProjectProgress = (project: Project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completed = project.tasks.filter((t: any) => t.status === 'done').length;
    return Math.round((completed / project.tasks.length) * 100);
  };

  // Professional Chart configurations
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const textColorSecondary = isDark ? '#94a3b8' : '#64748b';
  
  const taskStatusChartOptions = {
    chart: {
      type: 'donut' as const,
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false },
    },
    labels: ['To Do', 'In Progress', 'In Review', 'Done'],
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270,
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '11px',
              fontWeight: 600,
              color: textColor,
            },
            value: {
              show: true,
              fontSize: '18px',
              fontWeight: 700,
              color: textColor,
            },
            total: {
              show: true,
              label: 'Total Tasks',
              fontSize: '10px',
              color: textColorSecondary,
              fontWeight: 500,
              formatter: () => stats?.total || 0,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '10px',
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
        colors: ['#ffffff'],
      },
      dropShadow: {
        enabled: true,
        blur: 3,
        opacity: 0.5,
        color: '#000000',
      },
    },
    fill: {
      type: 'gradient',
    },
    legend: {
      position: 'left' as const,
      fontSize: '11px',
      formatter: function(val: string, opts: any) {
        return val + " - " + opts.w.globals.series[opts.seriesIndex];
      },
      labels: {
        colors: textColor,
      },
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: '100%',
        },
        legend: {
          position: 'bottom' as const,
          fontSize: '10px',
        },
        dataLabels: {
          style: {
            fontSize: '9px',
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            colors: ['#ffffff'],
          },
        },
      },
    }],
  };

  const taskStatusChartSeries = stats
    ? [stats.todo || 0, stats.inProgress || 0, stats.inReview || 0, stats.done || 0]
    : [0, 0, 0, 0];

  const priorityChartOptions = {
    chart: {
      type: 'bar' as const,
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 6,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontWeight: 600,
        colors: [textColor],
      },
    },
    xaxis: {
      categories: ['Low', 'Medium', 'High', 'Urgent'],
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: textColorSecondary,
        },
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
          fontSize: '12px',
          colors: textColorSecondary,
        },
      },
    },
    colors: ['#3b82f6'],
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: (val: number) => `${val} tasks`,
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
    },
  };

  const priorityChartSeries = [
    {
      name: 'Tasks',
      data: priorityStats
        ? [
            priorityStats.low || 0,
            priorityStats.medium || 0,
            priorityStats.high || 0,
            priorityStats.urgent || 0,
          ]
        : [0, 0, 0, 0],
    },
  ];

  const getCompletionOverTime = () => {
    const data: { date: string; completed: number }[] = [];
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const daysDiff = Math.ceil((today.getTime() - lastMonth.getTime()) / (1000 * 60 * 60 * 24));
    const step = daysDiff > 30 ? 3 : daysDiff > 15 ? 2 : 1;
    
    for (let i = 0; i <= daysDiff; i += step) {
      const date = new Date(lastMonth);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTasks = allTasks.filter((task) => {
        if (!task.updatedAt) return false;
        const taskDate = new Date(task.updatedAt).toISOString().split('T')[0];
        return taskDate <= dateStr && task.status === 'done';
      });

      const completed = dayTasks.length;
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed,
      });
    }

    return data;
  };

  const completionOverTimeData = getCompletionOverTime();

  const completionChartOptions = {
    chart: {
      type: 'area' as const,
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    colors: ['#3b82f6'],
    xaxis: {
      categories: completionOverTimeData.map((d) => d.date),
      labels: {
        style: {
          fontSize: '11px',
          colors: textColorSecondary,
        },
        rotate: -45,
        rotateAlways: true,
        hideOverlappingLabels: true,
        showDuplicates: false,
        trim: false,
        maxHeight: 80,
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
          fontSize: '11px',
          colors: textColorSecondary,
        },
      },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: (val: number) => `${val} completed`,
      },
    },
    grid: {
      borderColor: isDark ? '#374151' : '#e2e8f0',
      strokeDashArray: 0,
    },
    dataLabels: {
      enabled: false,
    },
  };

  const completionChartSeries = [
    {
      name: 'Completed',
      data: completionOverTimeData.map((d) => d.completed),
    },
  ];

  const statsCards = [
        {
          label: 'Total Tasks',
      value: stats?.total || 0,
          change: '+0%',
          icon: Target,
          color: 'bg-blue-500',
          bgLight: 'bg-blue-50',
          trend: 'up' as const,
        },
        {
          label: 'In Progress',
      value: stats?.inProgress || 0,
          change: '+0%',
          icon: Clock,
          color: 'bg-amber-500',
          bgLight: 'bg-amber-50',
          trend: 'up' as const,
        },
        {
          label: 'Completed',
      value: stats?.done || 0,
          change: '+0%',
          icon: CheckCircle,
          color: 'bg-emerald-500',
          bgLight: 'bg-emerald-50',
          trend: 'up' as const,
        },
        {
          label: 'Overdue',
      value: stats?.overdue || 0,
          change: '-0%',
          icon: AlertCircle,
          color: 'bg-rose-500',
          bgLight: 'bg-rose-50',
          trend: 'down' as const,
        },
  ];

  if (error && !stats && !loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Professional Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-0.5">
                Dashboard
              </h1>
              <p className="text-xs text-slate-600 dark:text-gray-400">
                Welcome back, {user?.firstName}. Here's your project overview.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">Today</div>
                <div className="text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Key Metrics */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Card 
                key={idx} 
                className="border-2 border-slate-200 shadow-sm bg-blue-50 dark:bg-gray-800"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                      <div className="h-6 bg-slate-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                      <div className="h-2 bg-slate-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-lg flex-shrink-0 border border-slate-200 shadow-sm">
                      <div className="h-5 w-5 bg-slate-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            statsCards.map((stat, idx) => {
            const iconColorMap: Record<string, string> = {
              'bg-blue-500': 'text-blue-500',
              'bg-amber-500': 'text-amber-500',
              'bg-emerald-500': 'text-emerald-500',
              'bg-rose-500': 'text-rose-500',
            };
            const iconColor = iconColorMap[stat.color] || 'text-blue-500';
            
            return (
              <Card 
                key={idx} 
                className="border-2 border-slate-200 shadow-sm shadow-sm hover:shadow-md transition-all bg-blue-50 dark:bg-gray-800"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                        {stat.label}
                      </p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">
                        {stat.value.toLocaleString()}
                      </p>
                      <div className={`flex items-center text-[10px] font-medium ${
                      stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-gray-400'
                    }`}>
                      {stat.trend === 'up' ? (
                          <ArrowUp className="h-3 w-3 mr-0.5" />
                      ) : (
                          <ArrowDown className="h-3 w-3 mr-0.5" />
                      )}
                      <span>{stat.change} from last month</span>
                    </div>
                  </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-lg flex-shrink-0 border border-slate-200 shadow-sm">
                      <stat.icon className={`h-5 w-5 ${iconColor} dark:text-blue-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })
          )}
        </div>

        {/* Tabs Section */}
        <Card className="border-2 border-slate-200 shadow-sm shadow-sm bg-blue-50 dark:bg-gray-800">
          <CardContent className="p-4">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 text-slate-600 dark:text-gray-300 shadow-sm">
            <TabsTrigger 
              value="overview" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all"
            >
              <Activity className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Projects Overview */}
            {projects.length > 0 && (
              <Card className="border-2 border-slate-200 shadow-sm shadow-sm bg-blue-50 dark:bg-gray-800">
                <CardHeader className="border-b border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Active Projects</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-gray-400">Track progress across your active projects</CardDescription>
                    </div>
                    <Link
                      to="/projects"
                      className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid md:grid-cols-3 gap-4">
                     {projects.map((project) => {
                      const progress = calculateProjectProgress(project);
                      const taskCount = project.tasks?.length || 0;
                      const completedCount = project.tasks?.filter((t: any) => t.status === 'done').length || 0;
                      
                      return (
                        <div
                          key={project.id}
                          className="border border-slate-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all bg-white dark:bg-gray-800"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                              <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                              {progress}%
                            </span>
                          </div>
                          <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-2.5">{project.name}</h3>
                          <div className="w-full bg-slate-100 dark:bg-gray-700 rounded-full h-1.5 mb-3">
                            <div
                              className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-[11px] text-slate-600 dark:text-gray-400">
                              <span className="font-semibold text-slate-900 dark:text-white">{completedCount}</span> of <span className="font-semibold text-slate-900 dark:text-white">{taskCount}</span> tasks
                            </div>
                            {project.owner && (
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-semibold shadow-sm">
                                {getInitials(project.owner.firstName, project.owner.lastName)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Tasks */}
            <Card className="border-2 border-slate-200 shadow-sm shadow-sm bg-blue-50 dark:bg-gray-800">
              <CardHeader className="border-b border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Recent Tasks</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-gray-400">Your most recent task updates</CardDescription>
                  </div>
                  <Link
                    to="/tasks"
                    className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2.5">
                  {recentTasks.length > 0 ? (
                    recentTasks.map((task) => (
                      <div
                        key={task.id}
                        className="border border-slate-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-all bg-white dark:bg-gray-800"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-xs text-slate-900 dark:text-white mb-1.5 truncate">{task.title}</h3>
                            <div className="flex items-center gap-1.5 flex-wrap">
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
                              <div className="flex items-center text-[10px] text-slate-600 dark:text-gray-400">
                                <Calendar className="w-3 h-3 mr-0.5" />
                                {formatDate(task.dueDate)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {task.assignee && (
                              <div className="text-right">
                                <div className="text-[10px] font-medium text-slate-700 dark:text-gray-300">
                                  {task.assignee.firstName} {task.assignee.lastName}
                                </div>
                              </div>
                            )}
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shadow-sm flex-shrink-0">
                              {task.assignee
                                ? getInitials(task.assignee.firstName, task.assignee.lastName)
                                : 'U'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-gray-700 rounded-full mb-3">
                        <Target className="w-6 h-6 text-slate-400 dark:text-gray-500" />
                      </div>
                      <p className="text-slate-500 dark:text-gray-400 text-sm">No tasks yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Status Distribution */}
              <Card className="border-2 border-slate-200 shadow-sm shadow-sm bg-blue-50 dark:bg-gray-800">
                <CardHeader className="border-b border-slate-200 shadow-sm">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Task Distribution</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-gray-400">Overview of task statuses</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <Chart
                    options={taskStatusChartOptions}
                    series={taskStatusChartSeries}
                    type="donut"
                    height={280}
                    width="100%"
                  />
                </CardContent>
              </Card>

              {/* Tasks by Priority */}
              <Card className="border-2 border-slate-200 shadow-sm shadow-sm bg-blue-50 dark:bg-gray-800">
                <CardHeader className="border-b border-slate-200 shadow-sm">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Priority Levels</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-gray-400">Tasks grouped by priority</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <Chart
                    options={priorityChartOptions}
                    series={priorityChartSeries}
                    type="bar"
                    height={280}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Completion Trend */}
            <Card className="border-2 border-slate-200 shadow-sm shadow-sm bg-blue-50 dark:bg-gray-800">
              <CardHeader className="border-b border-slate-200 shadow-sm">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Completion Trend</CardTitle>
                <CardDescription className="text-slate-600 dark:text-gray-400">Task completion over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <Chart
                  options={completionChartOptions}
                  series={completionChartSeries}
                  type="area"
                  height={320}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;