import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

interface LoginRequest {
  identifier: string;
  password: string;
}

interface LoginResponse {
  user?: {
    id: string;
    username: string;
    email: string;
  };
  error?: string;
  errors?: Record<string, string>;
}

interface SessionResponse {
  authenticated: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

interface LogoutResponse {
  success: boolean;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/auth",
    credentials: "include",
  }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    getSession: builder.query<SessionResponse, void>({
      query: () => ({
        url: "/session",
        method: "GET",
        cache: "no-store",
      }),
      providesTags: ["Auth"],
      refetchOnMountOrArgChange: true,
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetSessionQuery,
} = authApi;
