import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Task } from '../../src/types';

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
      invalidatesTags: ['Tasks'],
    }),
    updateTask: builder.mutation<UpdateTaskResponse, UpdateTaskRequest>({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tasks', id }, { type: 'Tasks', id: 'LIST' }],
    }),
    deleteTask: builder.mutation<DeleteTaskResponse, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Tasks', id }, { type: 'Tasks', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi;
