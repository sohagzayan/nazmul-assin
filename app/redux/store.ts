import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './features/tasksSlice';
import { taskApi } from './features/taskApi';
import { authApi } from './features/authApi';
import { teamsApi } from './features/teamsApi';
import { projectsApi } from './features/projectsApi';
import { activityLogsApi } from './features/activityLogsApi';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    [taskApi.reducerPath]: taskApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [teamsApi.reducerPath]: teamsApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [activityLogsApi.reducerPath]: activityLogsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      taskApi.middleware,
      authApi.middleware,
      teamsApi.middleware,
      projectsApi.middleware,
      activityLogsApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

