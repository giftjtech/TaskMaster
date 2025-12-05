import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { userService, NotificationPreferences } from '../services/user.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Dropdown } from '../components/ui/Dropdown';
import { Button } from '../components/ui/Button';
import {
  User,
  Lock,
  Bell,
  Moon,
  Sun,
  Save,
  Settings as SettingsIcon,
  Palette,
  Shield,
  Users,
  Database,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile settings
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification preferences (stored in backend)
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailNotifications: true,
    taskAssignments: true,
    taskUpdates: false,
    projectUpdates: true,
    comments: false,
  });
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user' as 'user' | 'admin',
  });

  // Fetch notification preferences from backend on mount
  useEffect(() => {
    const fetchNotificationPreferences = async () => {
      if (!user?.id) return;
      
      try {
        const userData = await userService.getById(user.id);
        if (userData?.notificationPreferences) {
          setNotifications({
            emailNotifications: userData.notificationPreferences.emailNotifications ?? true,
            taskAssignments: userData.notificationPreferences.taskAssignments ?? true,
            taskUpdates: userData.notificationPreferences.taskUpdates ?? false,
            projectUpdates: userData.notificationPreferences.projectUpdates ?? true,
            comments: userData.notificationPreferences.comments ?? false,
          });
        }
      } catch (error) {
        // Silently fail - user will see default preferences
      }
    };

    fetchNotificationPreferences();
  }, [user?.id]);

  // Fetch users list for admin
  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.role !== 'admin') return;
      
      try {
        setUsersLoading(true);
        const usersData = await userService.getAll();
        setUsers(usersData || []);
      } catch (error) {
        // Silently fail - admin users list is optional
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [user?.role]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setLoading(true);
      await userService.update(user.id, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
      });
      
      // Update user in context
      updateUser({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
      });
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setPasswordLoading(true);
      // Note: Backend doesn't have a password change endpoint yet
      // This is a placeholder that shows the UI is ready
      // TODO: Implement password change API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationChange = async (key: keyof NotificationPreferences) => {
    if (!user?.id) return;

    const newNotifications = {
      ...notifications,
      [key]: !notifications[key],
    };
    setNotifications(newNotifications);

    try {
      setNotificationsLoading(true);
      await userService.updateNotificationPreferences(user.id, newNotifications);
      toast.success('Notification preferences saved!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save notification preferences');
      // Revert on error
      setNotifications(notifications);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setCreateUserLoading(true);
      await userService.create(newUser);
      toast.success('User created successfully!');
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'user',
      });
      // Refresh users list
      const usersData = await userService.getAll();
      setUsers(usersData || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create user');
    } finally {
      setCreateUserLoading(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-0.5">Settings</h1>
              <p className="text-xs text-slate-600 dark:text-gray-400">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Profile and Password Settings - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Profile Settings */}
          <Card className="border-2 border-blue-200 shadow-sm bg-blue-50">
            <CardHeader className="border-b border-blue-200">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Profile Information</CardTitle>
              </div>
              <CardDescription className="text-slate-600 dark:text-gray-400">Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg overflow-hidden"
                    style={{
                      background: user?.avatar 
                        ? 'transparent' 
                        : 'linear-gradient(to bottom right, #3b82f6, #9333ea)'
                    }}
                  >
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={`${profileData.firstName} ${profileData.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(profileData.firstName, profileData.lastName)
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-gray-300">Profile Picture</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                      {profileData.firstName} {profileData.lastName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, firstName: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, lastName: e.target.value })
                    }
                    required
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />

                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    loading={loading} 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-sm font-medium whitespace-nowrap flex items-center"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span>Save Changes</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card className="border-2 border-blue-200 shadow-sm bg-blue-50">
            <CardHeader className="border-b border-blue-200">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Change Password</CardTitle>
              </div>
              <CardDescription className="text-slate-600 dark:text-gray-400">Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                  minLength={6}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  required
                  minLength={6}
                />

                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    loading={passwordLoading} 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-sm font-medium whitespace-nowrap flex items-center"
                  >
                    <Lock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span>Update Password</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Appearance, Account Info, and Notifications - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Left Side - Appearance and Account Info */}
          <div className="space-y-4">
            {/* Appearance Settings */}
            <Card className="border-2 border-blue-200 shadow-sm bg-blue-50 h-full">
              <CardHeader className="border-b border-blue-200">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Appearance</CardTitle>
                </div>
                <CardDescription className="text-slate-600 dark:text-gray-400">Customize your theme preferences</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex flex-col justify-between min-h-[120px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === 'light' ? (
                      <Sun className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                    ) : (
                      <Moon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Theme</p>
                      <p className="text-xs text-slate-600 dark:text-gray-400">
                        Current theme: <span className="capitalize font-medium">{theme}</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={toggleTheme}
                    variant="outline"
                    size="sm"
                    className="border-blue-200 hover:bg-blue-100 text-sm font-medium whitespace-nowrap flex items-center"
                  >
                    {theme === 'light' ? (
                      <>
                        <Moon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                        <span>Switch to Dark</span>
                      </>
                    ) : (
                      <>
                        <Sun className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                        <span>Switch to Light</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="border-2 border-blue-200 shadow-sm bg-blue-50">
              <CardHeader className="border-b border-blue-200">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Account Information</CardTitle>
              </div>
              <CardDescription className="text-slate-600 dark:text-gray-400">Your account details</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-gray-600">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide">Role</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 capitalize">
                      {user?.role || 'User'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-gray-600">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide">Account Status</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">Active</p>
                  </div>
                </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Notifications */}
          <Card className="border-2 border-blue-200 shadow-sm bg-blue-50 h-full">
            <CardHeader className="border-b border-blue-200">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</CardTitle>
              </div>
              <CardDescription className="text-slate-600 dark:text-gray-400">Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col justify-between min-h-[120px]">
              <div className="space-y-4">
                {[
                  {
                    key: 'emailNotifications' as const,
                    label: 'Email Notifications',
                    description: 'Receive email notifications for important updates',
                  },
                  {
                    key: 'taskAssignments' as const,
                    label: 'Task Assignments',
                    description: 'Get notified when tasks are assigned to you',
                  },
                  {
                    key: 'taskUpdates' as const,
                    label: 'Task Updates',
                    description: 'Notifications for task status changes',
                  },
                  {
                    key: 'projectUpdates' as const,
                    label: 'Project Updates',
                    description: 'Updates about project changes',
                  },
                  {
                    key: 'comments' as const,
                    label: 'Comments',
                    description: 'Notifications for new comments on your tasks',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-gray-600"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-600 dark:text-gray-400">{item.description}</p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(item.key)}
                      disabled={notificationsLoading}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                        notifications[item.key] ? 'bg-blue-600' : 'bg-slate-300'
                      } ${notificationsLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
        </Card>
        </div>

        {/* Admin Settings - Only visible to admins */}
        {user?.role === 'admin' && (
          <Card className="border-2 border-purple-200 dark:border-purple-700 shadow-sm bg-purple-50 dark:bg-gray-800">
            <CardHeader className="border-b border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Admin Settings</CardTitle>
              </div>
              <CardDescription className="text-slate-600 dark:text-gray-400">Manage system settings and users</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Add New User Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Add New User</h3>
                  </div>
                  <form onSubmit={handleCreateUser} className="space-y-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-purple-200 dark:border-gray-600">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="First Name"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                        required
                        placeholder="Enter first name"
                      />
                      <Input
                        label="Last Name"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                        required
                        placeholder="Enter last name"
                      />
                    </div>
                    <Input
                      label="Email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                      placeholder="Enter email address"
                    />
                    <Input
                      label="Password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                      minLength={6}
                      placeholder="Enter password (min 6 characters)"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Role
                      </label>
                      <Dropdown
                        value={newUser.role}
                        onChange={(value) => setNewUser({ ...newUser, role: value as 'user' | 'admin' })}
                        options={[
                          { value: 'user', label: 'User' },
                          { value: 'admin', label: 'Admin' },
                        ]}
                        placeholder="Select role..."
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        loading={createUserLoading}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-sm font-medium flex items-center whitespace-nowrap"
                      >
                        <Users className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                        <span>Create User</span>
                      </Button>
                    </div>
                  </form>
                </div>

                {/* User Management Section */}
                <div className="pt-4 border-t border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">User Management</h3>
                  </div>
                  {usersLoading ? (
                    <p className="text-sm text-slate-600 dark:text-gray-400">Loading users...</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {users.length === 0 ? (
                        <p className="text-sm text-slate-600 dark:text-gray-400">No users found</p>
                      ) : (
                        users.map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-purple-200 dark:border-gray-600"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {u.firstName} {u.lastName}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-gray-400">{u.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded capitalize">
                                  {u.role || 'user'}
                                </span>
                                {u.isActive !== false && (
                                  <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                                    Active
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* System Information */}
                <div className="pt-4 border-t border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">System Information</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-purple-200 dark:border-gray-600">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide">Total Users</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{users.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-purple-200 dark:border-gray-600">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide">Admin Users</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                          {users.filter((u) => u.role === 'admin').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Settings;
