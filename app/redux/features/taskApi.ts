import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Task } from '../../src/types';

// Import activityLogsApi to invalidate its cache
import { activityLogsApi } from './activityLogsApi';

interface GetTasksResponse {
  tasks?: Task[];
  error?: string;
}

interface CreateTaskRequest {
  title: string;
  description: string;
  projectId: string;
  assignedMemberId?: string | null;
  priority: Task['priority'];
  status: Task['status'];
}

interface CreateTaskResponse {
  task?: Task;
  error?: string;
}

interface UpdateTaskRequest {
  id: string;
  updates: Partial<Task>;
}

interface UpdateTaskResponse {
  task?: Task;
  error?: string;
}

interface DeleteTaskResponse {
  success?: boolean;
  error?: string;
}

interface ReassignTasksResponse {
  success?: boolean;
  reassignments?: Array<{
    taskId: string;
    taskTitle: string;
    fromMemberName: string;
    toMemberName: string;
  }>;
  count?: number;
  error?: string;
}

export const taskApi = createApi({
  reducerPath: 'taskApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/tasks',
    credentials: 'include',
  }),
  tagTypes: ['Tasks'],
  endpoints: (builder) => ({
    getTasks: builder.query<GetTasksResponse, void>({
      query: () => '',
      providesTags: (result) =>
        result?.tasks
          ? [
              ...result.tasks.map(({ id }) => ({ type: 'Tasks' as const, id })),
              { type: 'Tasks', id: 'LIST' },
            ]
          : [{ type: 'Tasks', id: 'LIST' }],
    }),
    createTask: builder.mutation<CreateTaskResponse, CreateTaskRequest>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Tasks', id: 'LIST' }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(activityLogsApi.util.invalidateTags([{ type: 'ActivityLogs', id: 'LIST' }]));
        } catch {
          // Error handling is done by the mutation
        }
      },
    }),
    updateTask: builder.mutation<UpdateTaskResponse, UpdateTaskRequest>({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tasks', id }, { type: 'Tasks', id: 'LIST' }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(activityLogsApi.util.invalidateTags([{ type: 'ActivityLogs', id: 'LIST' }]));
        } catch {
          // Error handling is done by the mutation
        }
      },
    }),
    deleteTask: builder.mutation<DeleteTaskResponse, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Tasks', id }, { type: 'Tasks', id: 'LIST' }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(activityLogsApi.util.invalidateTags([{ type: 'ActivityLogs', id: 'LIST' }]));
        } catch {
          // Error handling is done by the mutation
        }
      },
    }),
    reassignTasks: builder.mutation<ReassignTasksResponse, void>({
      query: () => ({
        url: '/reassign',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Tasks', id: 'LIST' }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate activity logs after successful reassignment
          dispatch(activityLogsApi.util.invalidateTags([{ type: 'ActivityLogs', id: 'LIST' }]));
        } catch {
          // Error handling is done by the mutation
        }
      },
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useReassignTasksMutation,
} = taskApi;
