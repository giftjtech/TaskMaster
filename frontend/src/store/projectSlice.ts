import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../services/project.service';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
}

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  loading: false,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    removeProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
    },
    setSelectedProject: (state, action: PayloadAction<Project | null>) => {
      state.selectedProject = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setProjects,
  addProject,
  updateProject,
  removeProject,
  setSelectedProject,
  setLoading: setProjectLoading,
} = projectSlice.actions;
export default projectSlice.reducer;

