import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Task } from '../../src/types';
import { demoTasks } from '../../src/data/demoData';

export const taskApi = createApi({
  reducerPath: 'taskApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Tasks'],
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], void>({
      queryFn: async () => ({
        data: demoTasks.map((task) => ({ ...task })),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Tasks' as const, id })),
              { type: 'Tasks', id: 'LIST' },
            ]
          : [{ type: 'Tasks', id: 'LIST' }],
    }),
  }),
});

export const { useGetTasksQuery } = taskApi;

