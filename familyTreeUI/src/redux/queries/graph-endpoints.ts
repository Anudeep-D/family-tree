import { baseUrl } from "@/constants/constants";
import { AppEdge } from "@/types/edgeTypes";
import { AppNode } from "@/types/nodeTypes";
import { getCookie } from "@/utils/common";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define DTO interfaces matching the Java DTOs
interface FlowNodeDTO {
  id: string;
  type?: string; // Or specific node types union
  data?: any;
}

interface FlowEdgeDTO {
  id: string;
  source: string;
  target: string;
  type?: string; // Or specific edge types union
  data?: any;
}

interface GraphDiffDTO {
  addedNodes?: FlowNodeDTO[];
  updatedNodes?: FlowNodeDTO[];
  deletedNodeIds?: string[];
  addedEdges?: FlowEdgeDTO[];
  updatedEdges?: FlowEdgeDTO[];
  deletedEdgeIds?: string[];
}

export const graphApi = createApi({
  reducerPath: "graphApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/trees`, // Changed from /api/trees
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
    getFamilyTree: builder.query<
      { nodes: AppNode[]; edges: AppEdge[] },
      { treeId: string; isImmediate: boolean; id: string }
    >({
      // Assuming this also needs treeId
      query(args) {
        return {
          url: `/${args.treeId}/graph/${args.id}/familytree`, // Changed from args.treeId
          params: { isImmediate: args.isImmediate },
        };
      },
      providesTags: ["graphApi"],
    }),
    updateGraph: builder.mutation<void, { treeId: string; diff: GraphDiffDTO }>(
      {
        query: (args) => ({
          url: `/${args.treeId}/graph`,
          method: "POST",
          body: args.diff,
        }),
        invalidatesTags: ["graphApi"], // Invalidate to refetch graph data after update
      }
    ),
  }),
});

export const {
  useGetGraphQuery,
  useGetFamilyTreeQuery,
  useUpdateGraphMutation, // Add this export
} = graphApi;
