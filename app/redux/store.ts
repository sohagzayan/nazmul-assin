import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './features/tasksSlice';
import { taskApi } from './features/taskApi';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    [taskApi.reducerPath]: taskApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(taskApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

