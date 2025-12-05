import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, User, Settings, LogOut, ChevronDown, CheckCircle, FolderKanban, Loader2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '../notifications/NotificationBell';
import { useClickOutside } from '../../hooks/useClickOutside';
import { taskService, Task } from '../../services/task.service';
import { projectService, Project } from '../../services/project.service';
import { useDebounce } from '../../hooks/useDebounce';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  onMenuClick: () => void;
}

interface SearchResult {
  type: 'task' | 'project';
  id: string;
  title: string;
  description?: string;
  projectName?: string;
  status?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useClickOutside(profileRef, () => setProfileOpen(false));
  useClickOutside(searchRef, () => setSearchOpen(false));

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Universal search across tasks and projects
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch.trim() || debouncedSearch.length < 2) {
        setSearchResults([]);
        setSearchOpen(false);
        return;
      }

      setSearchLoading(true);
      setSearchOpen(true);

      try {
        const query = debouncedSearch.toLowerCase().trim();
        const results: SearchResult[] = [];

        // Search tasks
        try {
          const tasksResponse = await taskService.getAll({ limit: 100 });
          let tasks: Task[] = [];
          if (tasksResponse) {
            if (Array.isArray(tasksResponse)) {
              tasks = tasksResponse;
            } else if (tasksResponse.data && Array.isArray(tasksResponse.data)) {
              // PaginatedResponseDto structure: { data: Task[], total, page, limit, totalPages }
              tasks = tasksResponse.data;
            } else if (tasksResponse.success && tasksResponse.data?.data && Array.isArray(tasksResponse.data.data)) {
              // Wrapped response: { success: true, data: { data: Task[], ... } }
              tasks = tasksResponse.data.data;
            }
          }
          
          
          const matchingTasks = tasks.filter((task: Task) => {
            const titleMatch = task.title?.toLowerCase().includes(query);
            const descMatch = task.description?.toLowerCase().includes(query);
            const tagMatch = task.tags?.some(tag => 
              tag.name?.toLowerCase().includes(query)
            );
            return titleMatch || descMatch || tagMatch;
          });

          matchingTasks.slice(0, 5).forEach((task: Task) => {
            results.push({
              type: 'task',
              id: task.id,
              title: task.title,
              description: task.description,
              projectName: task.project?.name,
              status: task.status,
            });
          });
        } catch (error) {
          console.error('❌ Error searching tasks:', error);
        }

        // Search projects
        try {
          const projectsResponse = await projectService.getAll();
          
          const projects = Array.isArray(projectsResponse?.data)
            ? projectsResponse.data
            : Array.isArray(projectsResponse)
            ? projectsResponse
            : [];

          const matchingProjects = projects.filter((project: Project) => {
            const nameMatch = project.name?.toLowerCase().includes(query);
            const descMatch = project.description?.toLowerCase().includes(query);
            return nameMatch || descMatch;
          });

          matchingProjects.slice(0, 5).forEach((project: Project) => {
            results.push({
              type: 'project',
              id: project.id,
              title: project.name,
              description: project.description,
            });
          });
        } catch (error) {
          console.error('❌ Error searching projects:', error);
        }

        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // If there are results, navigate to the first one
      if (searchResults.length > 0) {
        const firstResult = searchResults[0];
        if (firstResult.type === 'task') {
          navigate(`/tasks?taskId=${firstResult.id}`);
        } else {
          navigate(`/projects`);
        }
      } else {
        // Fallback to tasks page with search
        navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
      }
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'task') {
      navigate(`/tasks?taskId=${result.id}`);
    } else {
      navigate(`/projects`);
    }
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setProfileOpen(false);
    navigate('/profile', { replace: false });
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setProfileOpen(false);
    navigate('/settings', { replace: false });
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  return (
    <>
      {/* Desktop Top bar */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-pink-200 dark:border-gray-700 px-6 h-14 shadow-sm lg:block hidden flex-shrink-0 relative z-40">
        <div className="flex items-center justify-between gap-4 h-full">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length >= 2) {
                    setSearchOpen(true);
                  }
                }}
                onFocus={() => {
                  if (searchResults.length > 0 || searchQuery.trim().length >= 2) {
                    setSearchOpen(true);
                  }
                }}
                placeholder="Search tasks, projects..."
                className="w-full pl-10 pr-4 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 dark:focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              
              {/* Search Results Dropdown */}
              {searchOpen && (searchQuery.trim().length >= 2 || searchResults.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
                  {searchLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-5 w-5 animate-spin text-pink-500" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Search Results ({searchResults.length})
                        </p>
                      </div>
                      <div className="py-1">
                        {searchResults.map((result) => (
                          <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleResultClick(result)}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors text-left"
                          >
                            {result.type === 'task' ? (
                              <CheckCircle className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <FolderKanban className="h-5 w-5 text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {result.title}
                              </p>
                              {result.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                  {result.description}
                                </p>
                              )}
                              {result.projectName && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  Project: {result.projectName}
                                </p>
                              )}
                              {result.status && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
                                  {result.status.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : searchQuery.trim().length >= 2 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <p className="text-sm">No results found</p>
                      <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </form>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="relative"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon size={20} className="text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun size={20} className="text-gray-700 dark:text-gray-300" />
              )}
            </Button>
            <NotificationBell />
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                  {getInitials(user?.firstName, user?.lastName)}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-pink-600 dark:group-hover:text-pink-400">
                  {user?.firstName} {user?.lastName}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                    <p className="text-xs text-pink-600 dark:text-pink-400 mt-1 capitalize">{user?.role || 'User'}</p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={handleSettingsClick}
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  <button
                    onClick={handleLogout}
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Top bar */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-pink-200 dark:border-gray-700 px-4 py-2 shadow-sm lg:hidden flex-shrink-0 relative z-40">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onMenuClick}
            className="text-pink-400 dark:text-pink-500 hover:text-pink-600 dark:hover:text-pink-400"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xs">
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length >= 2) {
                    setSearchOpen(true);
                  }
                }}
                onFocus={() => {
                  if (searchResults.length > 0 || searchQuery.trim().length >= 2) {
                    setSearchOpen(true);
                  }
                }}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 dark:focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              
              {/* Search Results Dropdown */}
              {searchOpen && (searchQuery.trim().length >= 2 || searchResults.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto z-50">
                  {searchLoading ? (
                    <div className="flex items-center justify-center p-6">
                      <Loader2 className="h-4 w-4 animate-spin text-pink-500 dark:text-pink-400" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Results ({searchResults.length})
                        </p>
                      </div>
                      <div className="py-1">
                        {searchResults.map((result) => (
                          <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleResultClick(result)}
                            className="w-full flex items-start gap-2 px-3 py-2 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors text-left"
                          >
                            {result.type === 'task' ? (
                              <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <FolderKanban className="h-4 w-4 text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                {result.title}
                              </p>
                              {result.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                  {result.description}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : searchQuery.trim().length >= 2 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      <p className="text-xs">No results found</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </form>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="relative"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon size={18} className="text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun size={18} className="text-gray-700 dark:text-gray-300" />
              )}
            </Button>
            <NotificationBell />
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                {getInitials(user?.firstName, user?.lastName)}
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                    <p className="text-xs text-pink-600 dark:text-pink-400 mt-1 capitalize">{user?.role || 'User'}</p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={handleSettingsClick}
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  <button
                    onClick={handleLogout}
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

