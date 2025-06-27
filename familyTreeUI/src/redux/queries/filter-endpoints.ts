import { baseUrl } from "@/constants/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FilterProps } from "../treeConfigSlice";

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
      (FilterProps & { elementId: string })[],
      string
    >({
      // Renamed from getFilters, changed Filter[] to Filter[]
      query: (treeId) => ({
        url: "/",
        method: "GET",
        params: {
          treeId: treeId,
        },
      }),
      providesTags: ["filterApi"], // Changed from filterApi
    }),
    createFilter: builder.mutation<
      (FilterProps & { elementId: string }),
      { treeId: string; filter: FilterProps }
    >({
      // Renamed from createFilter
      query: (args) => ({
        // Renamed from filter
        url: "/create",
        method: "POST",
        params: {
          treeId: args.treeId,
        },
        body: args.filter,
      }),
      invalidatesTags: ["filterApi"],
    }),
    updateFilter: builder.mutation<
      (FilterProps & { elementId: string }),
      { filterId: string; filter: FilterProps }
    >({
      // Renamed from createFilter
      query: (args) => ({
        // Renamed from filter
        url: `/${args.filterId}`,
        method: "PATCH",
        body: args.filter,
      }),
      invalidatesTags: ["filterApi"],
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
