import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ActivityLog } from '../../src/types';

interface GetActivityLogsResponse {
  activityLogs?: ActivityLog[];
  error?: string;
}

export const activityLogsApi = createApi({
  reducerPath: 'activityLogsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/activity-logs',
    credentials: 'include',
  }),
  tagTypes: ['ActivityLogs'],
  endpoints: (builder) => ({
    getActivityLogs: builder.query<GetActivityLogsResponse, void>({
      query: () => '',
      providesTags: [{ type: 'ActivityLogs', id: 'LIST' }],
    }),
  }),
});

export const { useGetActivityLogsQuery } = activityLogsApi;

