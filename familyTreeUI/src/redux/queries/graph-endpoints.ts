import { baseUrl } from "@/constants/constants";
import { AppEdge } from "@/types/edgeTypes";
import { AppNode } from "@/types/nodeTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const graphApi = createApi({
  reducerPath: "graphApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/trees`, // Changed from /api/trees
    credentials: "include", // ✅ Send cookies (including session ID)
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  }),
  tagTypes: ["graphApi"],
  endpoints: (builder) => ({
    getGraph: builder.query<
      { nodes: AppNode[]; edges: AppEdge[] },
      { treeId: string } // Changed from treeId
    >({
      query(args) {
        return {
          url: `/${args.treeId}/graph`, // Changed from args.treeId
        };
      },
      providesTags: ["graphApi"],
    }),
    getFamily: builder.query({ // Assuming this also needs treeId
      query(args) {
        return {
          url: `/${args.treeId}/graph/${args.id}/family`, // Changed from args.treeId
        };
      },
      providesTags: ["graphApi"],
    }),
    getFamilyTree: builder.query({ // Assuming this also needs treeId
      query(args) {
        return {
          url: `/${args.treeId}/graph/${args.id}/familytree`, // Changed from args.treeId
        };
      },
      providesTags: ["graphApi"],
    }),
  }),
});

export const { useGetGraphQuery, useGetFamilyQuery, useGetFamilyTreeQuery } =
  graphApi;
