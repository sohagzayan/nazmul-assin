import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Team, TeamMember } from '../../src/types';

interface CreateTeamRequest {
  name: string;
  members: Omit<TeamMember, 'id'>[];
}

interface CreateTeamResponse {
  team?: Team;
  error?: string;
}

interface GetTeamsResponse {
  teams?: Team[];
  error?: string;
}

export const teamsApi = createApi({
  reducerPath: 'teamsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/teams',
    credentials: 'include',
  }),
  tagTypes: ['Teams'],
  endpoints: (builder) => ({
    getTeams: builder.query<GetTeamsResponse, void>({
      query: () => '',
      providesTags: (result) =>
        result?.teams
          ? [
              ...result.teams.map(({ id }) => ({ type: 'Teams' as const, id })),
              { type: 'Teams', id: 'LIST' },
            ]
          : [{ type: 'Teams', id: 'LIST' }],
    }),
    createTeam: builder.mutation<CreateTeamResponse, CreateTeamRequest>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Teams', id: 'LIST' }],
    }),
  }),
});

export const { useGetTeamsQuery, useCreateTeamMutation } = teamsApi;

