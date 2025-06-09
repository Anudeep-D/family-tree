import { baseUrl } from "@/constants/constants";
import { Role } from "@/types/common";
import { Project } from "@/types/entityTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/projects`,
    credentials: "include", // ✅ Send cookies (including session ID)
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  }),
  tagTypes: ["projectApi"],
  endpoints: (builder) => ({
    getProject: builder.query({
      query(args) {
        return {
          url: `/${args.projectId}`,
        };
      },
      providesTags: ["projectApi"],
    }),
    getProjects: builder.query<Project[], void>({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["projectApi"],
    }),
    createProject: builder.mutation<Project, Project>({
      query: (project) => ({
        url: "/create",
        method: "POST",
        body: {
          name: project.name,
          desc: project.desc,
          createdBy: project.createdBy,
          createdAt: project.createdAt,
        },
      }),
    }),
    addUsersToProject: builder.mutation<
      void,
      {
        projectId: string;
        users: {
          elementId: string;
          role: Role;
        }[];
      }
    >({
      query: (args) => ({
        url: `/${args.projectId}/addusers`,
        method: "POST",
        body: args.users,
      }),
    }),
  }),
});

export const {
  useGetProjectQuery,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useAddUsersToProjectMutation,
} = projectApi;
