import React, { useState, useEffect } from 'react';
import {
  Plus,
  MoreVertical,
  Search,
  Filter,
  X,
  Folder,
  Calendar,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { projectService, Project, CreateProjectDto } from '../services/project.service';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const Projects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<CreateProjectDto>({
    name: '',
    description: '',
    color: '#ec4899',
  });
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const colorOptions = [
    { value: '#ec4899', label: 'Pink', class: 'bg-pink-500' },
    { value: '#a855f7', label: 'Purple', class: 'bg-purple-500' },
    { value: '#3b82f6', label: 'Blue', class: 'bg-blue-500' },
    { value: '#10b981', label: 'Green', class: 'bg-green-500' },
    { value: '#f59e0b', label: 'Amber', class: 'bg-amber-500' },
    { value: '#ef4444', label: 'Red', class: 'bg-red-500' },
    { value: '#8b5cf6', label: 'Violet', class: 'bg-violet-500' },
    { value: '#06b6d4', label: 'Cyan', class: 'bg-cyan-500' },
  ];

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

  // Refresh data when page becomes visible or window regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        loadData();
      }
    };

    const handleFocus = () => {
      if (user) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAll();
      
      const projectsList = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      
      setProjects(projectsList);
      setFilteredProjects(projectsList);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Project name is required');
        return;
      }

      const projectData: CreateProjectDto = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        color: formData.color,
      };

      await projectService.create(projectData);
      toast.success('Project created successfully');
      setModalOpen(false);
      setFormData({
        name: '',
        description: '',
        color: '#ec4899',
      });
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create project');
    }
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;

    try {
      if (!formData.name.trim()) {
        toast.error('Project name is required');
        return;
      }

      const projectData: Partial<CreateProjectDto> = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        color: formData.color,
      };

      await projectService.update(selectedProject.id, projectData);
      toast.success('Project updated successfully');
      setModalOpen(false);
      setSelectedProject(null);
      setFormData({
        name: '',
        description: '',
        color: '#ec4899',
      });
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      await projectService.delete(selectedProject.id);
      toast.success('Project deleted successfully');
      setDeleteModalOpen(false);
      setSelectedProject(null);
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      color: project.color || '#ec4899',
    });
    setModalOpen(true);
    setMenuOpen(null);
  };

  const handleNewProject = () => {
    setSelectedProject(null);
    setFormData({
      name: '',
      description: '',
      color: '#ec4899',
    });
    setModalOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getProjectColorClass = (color?: string) => {
    if (!color) return 'bg-pink-500';
    const colorMap: Record<string, string> = {
      '#ec4899': 'bg-pink-500',
      '#a855f7': 'bg-purple-500',
      '#3b82f6': 'bg-blue-500',
      '#10b981': 'bg-green-500',
      '#f59e0b': 'bg-amber-500',
      '#ef4444': 'bg-red-500',
      '#8b5cf6': 'bg-violet-500',
      '#06b6d4': 'bg-cyan-500',
    };
    return colorMap[color] || 'bg-pink-500';
  };

  const getTotalTasks = () => {
    return projects.reduce((total, project) => total + (project.tasks?.length || 0), 0);
  };

  const getCompletedTasks = () => {
    return projects.reduce((total, project) => {
      const completed = project.tasks?.filter((task) => task.status === 'done').length || 0;
      return total + completed;
    }, 0);
  };

  return (
    <div className="h-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Page Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-pink-100 dark:border-gray-700 shadow-sm px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">✨ My Projects</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Organize and manage your projects</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-1.5 px-3 py-1.5 border border-pink-200 dark:border-gray-600 rounded-lg hover:border-pink-300 dark:hover:border-gray-500 hover:bg-pink-50 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-300">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button
              onClick={handleNewProject}
              className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
            <input
              type="text"
              placeholder="🔍 Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-sm border border-pink-200 dark:border-gray-600 rounded-lg focus:border-pink-400 dark:focus:border-pink-500 focus:ring-2 focus:ring-pink-100 dark:focus:ring-pink-900 transition outline-none bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-300 hover:text-pink-500 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="p-6 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-pink-400 dark:border-pink-500 border-t-transparent"></div>
          </div>
        )}
        {filteredProjects.length === 0 ? (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border-2 border-dashed border-pink-200 dark:border-gray-700 p-12 text-center">
            <Folder className="w-16 h-16 text-pink-300 dark:text-pink-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No projects found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first project'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleNewProject}
                className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.map((project) => {
              const taskCount = project.tasks?.length || 0;
              const completedCount = project.tasks?.filter((task) => task.status === 'done').length || 0;
              const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
              
              return (
                <div
                  key={project.id}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-pink-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-gray-600 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group relative"
                  onClick={() => handleProjectClick(project)}
                >
                  {/* Project Color Indicator */}
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-lg ${getProjectColorClass(project.color)} flex items-center justify-center shadow-sm`}
                    >
                      <Folder className="w-6 h-6 text-white" />
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === project.id ? null : project.id);
                        }}
                        className="text-pink-300 dark:text-pink-500 hover:text-pink-500 dark:hover:text-pink-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {menuOpen === project.id && (
                        <div className="absolute right-0 top-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-pink-200 dark:border-gray-700 py-1 z-10 min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProjectClick(project);
                            }}
                            className="w-full px-3 py-1.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProject(project);
                              setDeleteModalOpen(true);
                              setMenuOpen(null);
                            }}
                            className="w-full px-3 py-1.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Name */}
                  <h3 className="font-semibold text-base text-gray-800 dark:text-white mb-1 line-clamp-1">{project.name}</h3>

                  {/* Project Description */}
                  {project.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{project.description}</p>
                  )}

                  {/* Progress Bar */}
                  {taskCount > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="w-full bg-pink-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getProjectColorClass(project.color)}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Project Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-pink-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>{taskCount} tasks</span>
                      </div>
                      {completedCount > 0 && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>{completedCount}</span>
                        </div>
                      )}
                    </div>
                    {project.owner && (
                      <div className="w-6 h-6 bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                        {getInitials(project.owner.firstName, project.owner.lastName)}
                      </div>
                    )}
                  </div>

                  {/* Created Date */}
                  <div className="mt-2 pt-2 border-t border-pink-100 dark:border-gray-700">
                    <div className="flex items-center space-x-1 text-xs text-gray-400 dark:text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(project.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-2">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-xl border border-green-200 dark:border-green-800 flex items-center space-x-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
          <span className="text-xs font-semibold text-gray-800 dark:text-white">
            ✨ {getCompletedTasks()} completed tasks
          </span>
        </div>
        <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white rounded-lg px-3 py-1.5 shadow-xl flex items-center space-x-1.5">
          <Folder className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">{projects.length} projects</span>
        </div>
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-xl border border-blue-200 dark:border-blue-800 flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          <span className="text-xs font-semibold text-gray-800 dark:text-white">{getTotalTasks()} total tasks</span>
        </div>
      </div>

      {/* Create/Edit Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProject(null);
          setFormData({
            name: '',
            description: '',
            color: '#ec4899',
          });
        }}
        title={selectedProject ? 'Edit Project' : 'Create New Project'}
        size="lg"
      >
        <div className="flex flex-col h-full">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-3">
            <Input
              label="Project Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="✨ Enter project name"
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="📝 Enter project description"
              rows={3}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`h-10 rounded-lg border-2 transition-all ${
                      formData.color === color.value
                        ? 'border-gray-800 scale-110 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                    }`}
                  >
                    <div className={`w-full h-full rounded ${color.class}`}></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Fixed Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 flex gap-3 justify-end sticky bottom-0 z-10">
            <Button
              onClick={selectedProject ? handleUpdateProject : handleCreateProject}
              className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:shadow-lg"
            >
              {selectedProject ? '✨ Update Project' : '✨ Create Project'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setModalOpen(false);
                setSelectedProject(null);
                setFormData({
                  name: '',
                  description: '',
                  color: '#ec4899',
                });
              }}
              className="hover:bg-pink-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedProject(null);
        }}
        title="Delete Project"
        size="md"
      >
        <div className="flex flex-col">
          {/* Content */}
          <div className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Warning Icon */}
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              
              {/* Warning Message */}
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Are you sure?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                  Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedProject?.name}</span>? 
                  This action cannot be undone and all associated tasks will be removed.
                </p>
              </div>
            </div>
          </div>
          
          {/* Fixed Footer */}
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedProject(null);
              }}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteProject}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
