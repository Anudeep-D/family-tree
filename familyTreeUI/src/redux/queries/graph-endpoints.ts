import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const graphApi = createApi({
  reducerPath: 'graphApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/graph' }),
  endpoints: (builder) => ({
    getFamily: builder.query({
      query: (id: string) => `/${id}/family`,
    }),
    getFamilyTree: builder.query({
      query: (id: string) => `/${id}/familytree`,
    }),
  }),
});

export const { useGetFamilyQuery, useGetFamilyTreeQuery } = graphApi;