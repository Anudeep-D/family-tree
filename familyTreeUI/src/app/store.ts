import { configureStore } from "@reduxjs/toolkit";
import { graphApi } from "@/redux/queries/graph-endpoints";
import { projectApi } from "@/redux/queries/project-endpoints";
import { userApi } from "@/redux/queries/user-endpoints";
import { authApi } from "@/redux/queries/auth-endpoints";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [graphApi.reducerPath]: graphApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      projectApi.middleware,
      userApi.middleware,
      graphApi.middleware,
      authApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
