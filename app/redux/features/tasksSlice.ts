import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Task, TaskStatus } from '../../src/types';
import { demoTasks } from '../../src/data/demoData';

export interface TasksState {
  items: Task[];
}

const initialState: TasksState = {
  items: demoTasks.map((task) => ({ ...task })),
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask(state, action: PayloadAction<Task>) {
      state.items.push(action.payload);
    },
    updateTaskStatus(
      state,
      action: PayloadAction<{ id: string; status: TaskStatus }>
    ) {
      const task = state.items.find((item) => item.id === action.payload.id);
      if (task) {
        task.status = action.payload.status;
        task.updatedAt = new Date().toISOString();
      }
    },
    removeTask(state, action: PayloadAction<string>) {
      state.items = state.items.filter((task) => task.id !== action.payload);
    },
  },
});

export const { addTask, updateTaskStatus, removeTask } = tasksSlice.actions;

export default tasksSlice.reducer;

