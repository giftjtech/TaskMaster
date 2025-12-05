import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../services/task.service';

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
}

const initialState: TaskState = {
  tasks: [],
  selectedTask: null,
  loading: false,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  removeTask,
  setSelectedTask,
  setLoading,
} = taskSlice.actions;
export default taskSlice.reducer;

