import { baseUrl } from "@/constants/constants";
import { Role } from "@/types/common";
import { Tree } from "@/types/entityTypes"; // Changed from Tree
import { getCookie } from "@/utils/common";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const treeApi = createApi({
  reducerPath: "treeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/trees`, // Changed from /api/trees
    credentials: "include", // ✅ Send cookies (including session ID)
    prepareHeaders: (headers) => {
      // Set default headers
      headers.set("Content-Type", "application/json");
      headers.set("Accept", "application/json");
      headers.set("X-Requested-With", "XMLHttpRequest");

      // Add the X-XSRF-TOKEN header if the cookie is present
      const csrfToken = getCookie('XSRF-TOKEN'); // Default cookie name used by Spring Security
      if (csrfToken) {
        headers.set('X-XSRF-TOKEN', csrfToken);
      }
      return headers;
    },
    // The static 'headers' object is removed as prepareHeaders now handles them.
  }),
  tagTypes: ["treeApi"], // Changed from treeApi
  endpoints: (builder) => ({
    getTree: builder.query({ // Renamed from getTree
      query(args) {
        return {
          url: `/${args.treeId}`, // Renamed from args.treeId
        };
      },
      providesTags: ["treeApi"], // Changed from treeApi
    }),
    getTrees: builder.query<Tree[], void>({ // Renamed from getTrees, changed Tree[] to Tree[]
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["treeApi"], // Changed from treeApi
    }),
    createTree: builder.mutation<Tree, Tree>({ // Renamed from createTree
      query: (tree) => ({ // Renamed from tree
        url: "/create",
        method: "POST",
        body: {
          name: tree.name,
          desc: tree.desc,
          createdBy: tree.createdBy,
          createdAt: tree.createdAt,
        },
      }),
    }),
    addUsersToTree: builder.mutation< // Renamed from addUsersToTree
      void,
      {
        treeId: string; // Renamed from treeId
        users: {
          elementId: string;
          role: Role;
        }[];
      }
    >({
      query: (args) => ({
        url: `/${args.treeId}/addusers`, // Renamed from args.treeId
        method: "POST",
        body: args.users,
      }),
    }),
    updateUsersToTree: builder.mutation< // Renamed from addUsersToTree
      Record<string,number>,
      {
        treeId: string; // Renamed from treeId
        users: {
          elementId: string;
          role: Role | null;
        }[];
      }
    >({
      query: (args) => ({
        url: `/${args.treeId}/updateusers`, // Renamed from args.treeId
        method: "POST",
        body: args.users,
      }),
    }),
    deleteTree: builder.mutation<void, string>({
      query: (treeId) => ({
        url: `/${treeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['treeApi'],
    }),
    deleteMultipleTrees: builder.mutation<void, { ids: string[] }>({
      query: (body) => ({
        url: '/delete-multiple', // Assuming this endpoint for bulk delete
        method: 'POST', // Using POST as per example, adjust if backend uses DELETE with body
        body: body,
      }),
      invalidatesTags: ['treeApi'],
    }),
  }),
});

export const {
  useGetTreeQuery, // Renamed from useGetTreeQuery
  useGetTreesQuery, // Renamed from useGetTreesQuery
  useCreateTreeMutation, // Renamed from useCreateTreeMutation
  useAddUsersToTreeMutation, // Renamed from useAddUsersToTreeMutation
  useUpdateUsersToTreeMutation,
  useDeleteTreeMutation,
  useDeleteMultipleTreesMutation,
} = treeApi; // Renamed from treeApi