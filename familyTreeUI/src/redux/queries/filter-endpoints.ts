import { baseUrl } from "@/constants/constants";
import { Role } from "@/types/common"; // Changed from Filter
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FilterProps, TreeConfigState } from "../treeConfigSlice";

export const filterApi = createApi({
  reducerPath: "filterApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/filters`, // Changed from /api/filters
    credentials: "include", // ✅ Send cookies (including session ID)
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  }),
  tagTypes: ["filterApi"], // Changed from filterApi
  endpoints: (builder) => ({
    getFilters: builder.query<
      Pick<TreeConfigState, "savedFilters">,
      string
    >({
      // Renamed from getFilters, changed Filter[] to Filter[]
      query: (treeId) => ({
        url: "/",
        method: "GET",
        params: {
          tree_id: treeId,
        },
      }),
      providesTags: ["filterApi"], // Changed from filterApi
    }),
    createFilter: builder.mutation<
      Pick<TreeConfigState, "savedFilters">,
      { treeId: string; filter: FilterProps }
    >({
      // Renamed from createFilter
      query: (args) => ({
        // Renamed from filter
        url: "/create",
        method: "POST",
        params: {
          tree_id: args.treeId,
        },
        body: args.filter,
      }),
    }),
    updateFilter: builder.mutation<
      Pick<TreeConfigState, "savedFilters">,
      { filterId: string; filter: FilterProps }
    >({
      // Renamed from createFilter
      query: (args) => ({
        // Renamed from filter
        url: `/${args.filterId}`,
        method: "PATCH",
        body: args.filter,
      }),
    }),
    deleteMultipleFilters: builder.mutation<void, { ids: string[] }>({
      query: (body) => ({
        url: "/delete-multiple", // Assuming this endpoint for bulk delete
        method: "DELETE", // Using POST as per example, adjust if backend uses DELETE with body
        body: body,
      }),
      invalidatesTags: ["filterApi"],
    }),
  }),
});

export const {
  useGetFiltersQuery, // Renamed from useGetFiltersQuery
  useCreateFilterMutation, // Renamed from useCreateFilterMutation
  useUpdateFilterMutation,
  useDeleteMultipleFiltersMutation,
} = filterApi; // Renamed from filterApi
