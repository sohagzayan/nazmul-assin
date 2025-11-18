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

interface DeleteProjectResponse {
  success?: boolean;
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
      providesTags: (result) =>
        result?.projects
          ? [
              ...result.projects.map(({ id }) => ({ type: 'Projects' as const, id })),
              { type: 'Projects', id: 'LIST' },
            ]
          : [{ type: 'Projects', id: 'LIST' }],
    }),
    createProject: builder.mutation<CreateProjectResponse, CreateProjectRequest>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Projects', id: 'LIST' }],
    }),
    deleteProject: builder.mutation<DeleteProjectResponse, string>({
      query: (id) => ({
        url: `?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Projects', id: 'LIST' }],
    }),
  }),
});

export const { useGetProjectsQuery, useCreateProjectMutation, useDeleteProjectMutation } = projectsApi;

