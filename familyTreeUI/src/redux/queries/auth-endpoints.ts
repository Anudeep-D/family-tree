import { baseUrl } from "@/constants/constants";
import { User } from "@/types/entityTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/auth`,
    credentials: "include", // send cookies for session
  }),
  endpoints: (builder) => ({
    loginWithGoogle: builder.mutation<User, User>({
      query: (googleToken) => ({
        url: "/login",
        method: "POST",
        body: { token: googleToken },
      }),
    }),
    fetchSessionUser: builder.query<User, void>({
      query: () => ({
        url: "/session",
        method: "GET",
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
    useLoginWithGoogleMutation,
    useFetchSessionUserQuery,
    useLogoutMutation,
  } = authApi;