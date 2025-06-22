import { baseUrl } from "@/constants/constants";
import { User } from "@/types/entityTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/users`,
    credentials: "include", // ✅ Send cookies (including session ID)
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  }),
  tagTypes: ["userApi"],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["userApi"],
    }),
    getUsersAccessWithTree: builder.query<User[], { treeId: string }>({
      query: (args) => ({
        url: `/${args.treeId}`,
        method: "GET",
      }),
      providesTags: ["userApi"],
    }),
  }),
});

export const { useGetUsersQuery, useGetUsersAccessWithTreeQuery } = userApi;
