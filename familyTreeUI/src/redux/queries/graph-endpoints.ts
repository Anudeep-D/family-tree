import { baseUrl } from "@/constants/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const graphApi = createApi({
  reducerPath: "graphApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/graph`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  }),
  tagTypes: ["graphApi"],
  endpoints: (builder) => ({
    getGraph: builder.query({
      query() {
        return {
          url: `/`,
        };
      },
      providesTags: ["graphApi"],
    }),
    getFamily: builder.query({
      query(args) {
        return {
          url: `/${args.id}/family`,
        };
      },
      providesTags: ["graphApi"],
    }),
    getFamilyTree: builder.query({
      query(args) {
        return {
          url: `/${args.id}/familytree`,
        };
      },
      providesTags: ["graphApi"],
    }),
  }),
});

export const { useGetGraphQuery, useGetFamilyQuery, useGetFamilyTreeQuery } =
  graphApi;
