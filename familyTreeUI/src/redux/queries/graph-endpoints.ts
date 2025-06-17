import { baseUrl } from "@/constants/constants";
import { AppEdge } from "@/types/edgeTypes";
import { AppNode } from "@/types/nodeTypes";
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
    updateGraph: builder.mutation<void, { treeId: string; diff: GraphDiffDTO }>({
      query: (args) => ({
        url: `/${args.treeId}/graph`,
        method: 'POST',
        body: args.diff,
      }),
      invalidatesTags: ['graphApi'], // Invalidate to refetch graph data after update
    }),
  }),
});

export const { 
  useGetGraphQuery, 
  useGetFamilyQuery, 
  useGetFamilyTreeQuery,
  useUpdateGraphMutation // Add this export
} = graphApi;
