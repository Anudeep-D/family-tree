import { baseUrl } from "@/constants/constants";
import { Role } from "@/types/common";
import { Tree } from "@/types/entityTypes"; // Changed from Tree
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const treeApi = createApi({
  reducerPath: "treeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/trees`, // Changed from /api/trees
    credentials: "include", // ✅ Send cookies (including session ID)
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
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
  }),
});

export const {
  useGetTreeQuery, // Renamed from useGetTreeQuery
  useGetTreesQuery, // Renamed from useGetTreesQuery
  useCreateTreeMutation, // Renamed from useCreateTreeMutation
  useAddUsersToTreeMutation, // Renamed from useAddUsersToTreeMutation
} = treeApi; // Renamed from treeApi
