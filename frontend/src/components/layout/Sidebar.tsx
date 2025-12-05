import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../../utils/helpers';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: CheckCircle, label: 'Tasks', path: '/tasks' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
  ];

  const bottomMenuItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg border-r border-pink-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-2.5 border-b border-pink-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                ✨ TaskMaster
              </h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-pink-400 dark:text-pink-500 hover:text-pink-600 dark:hover:text-pink-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <nav className="p-3 space-y-1.5">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition text-sm ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t border-pink-200 dark:border-gray-700 space-y-1.5">
            {bottomMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition text-sm ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition text-sm text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-pink-200 dark:border-gray-700 transition-all duration-300 flex flex-col shadow-sm hidden lg:flex h-screen fixed left-0 top-0 z-30`}
      >
        {/* Logo */}
        <div className={`h-14 border-b border-pink-200 dark:border-gray-700 flex items-center flex-shrink-0 ${sidebarOpen ? 'px-2.5 justify-between' : 'px-2 justify-center'}`}>
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                ✨ TaskMaster
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-pink-400 dark:text-pink-500 hover:text-pink-600 dark:hover:text-pink-400 transition"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 space-y-1.5 overflow-y-auto ${sidebarOpen ? 'p-3' : 'p-2'}`}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center py-2 rounded-lg transition text-sm ${
                sidebarOpen 
                  ? 'space-x-2 px-3' 
                  : 'justify-center px-2'
              } ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom Menu - Fixed at bottom */}
        <div className={`mt-auto border-t border-pink-200 dark:border-gray-700 space-y-1.5 ${sidebarOpen ? 'p-3' : 'p-2'}`}>
          {bottomMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center py-2 rounded-lg transition text-sm ${
                sidebarOpen 
                  ? 'space-x-2 px-3' 
                  : 'justify-center px-2'
              } ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </div>

        {/* User profile section at bottom of sidebar */}
        <div className="flex-shrink-0 p-1 border-t border-pink-200 dark:border-gray-700">
          <div className={cn(
            "flex items-center p-0 rounded-sm hover:bg-red-200 transition-colors duration-200 relative",
            !sidebarOpen && "justify-center"
          )}>
            <div className="flex-shrink-0">
              <div className={cn(
                "rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium shadow-sm",
                sidebarOpen ? "h-9 w-10" : "h-8 w-8"
              )}>
                {getInitials(user?.firstName, user?.lastName)}
              </div>
            </div>
            {sidebarOpen && (
              <>
                <div className="ml-3 overflow-hidden flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                    {user?.role || 'User'}
                  </p>
                </div>
                <button
                  className="ml-auto p-1 mr-1 rounded-md text-gray-500 hover:text-white hover:bg-red-400 transition-colors"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
            {!sidebarOpen && (
              <button
                className="ml-2 p-1 rounded-md text-gray-500 hover:text-white hover:bg-red-400 transition-colors"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

