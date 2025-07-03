import { baseUrl } from "@/constants/constants";
import { User } from "@/types/entityTypes";
import { getCookie } from "@/utils/common";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/users`,
    credentials: "include", // ✅ Send cookies (including session ID)
    prepareHeaders: (headers) => {
      // Set default headers
      headers.set("Content-Type", "application/json");
      headers.set("Accept", "application/json");
      headers.set("X-Requested-With", "XMLHttpRequest");

      // Add the X-XSRF-TOKEN header if the cookie is present
      const csrfToken = getCookie("XSRF-TOKEN"); // Default cookie name used by Spring Security
      if (csrfToken) {
        headers.set("X-XSRF-TOKEN", csrfToken);
      }
      return headers;
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
