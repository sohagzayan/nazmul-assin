import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Project } from '../../src/types';

interface CreateProjectRequest {
  name: string;
  description: string;
  teamId: string;
}

interface CreateProjectResponse {
  project?: Project;
  error?: string;
}

interface GetProjectsResponse {
  projects?: Project[];
  error?: string;
}

export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/projects',
    credentials: 'include',
  }),
  tagTypes: ['Projects'],
  endpoints: (builder) => ({
    getProjects: builder.query<GetProjectsResponse, void>({
      query: () => '',
      providesTags: ['Projects'],
    }),
    createProject: builder.mutation<CreateProjectResponse, CreateProjectRequest>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
  }),
});

export const { useGetProjectsQuery, useCreateProjectMutation } = projectsApi;

