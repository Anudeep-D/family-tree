import { baseUrl } from "@/constants/constants";
import { User } from "@/types/entityTypes"; // Adjust path as needed
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the new response type for the session endpoint
interface SessionResponse {
  user: User;
  idToken: string | null;
}

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
    fetchSessionUser: builder.query<SessionResponse, void>({
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