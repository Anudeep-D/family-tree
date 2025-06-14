import { configureStore } from "@reduxjs/toolkit";
import { graphApi } from "@/redux/queries/graph-endpoints";
import { treeApi } from "@/redux/queries/tree-endpoints"; // Changed from treeApi
import { userApi } from "@/redux/queries/user-endpoints";
import { authApi } from "@/redux/queries/auth-endpoints";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [treeApi.reducerPath]: treeApi.reducer, // Changed from treeApi
    [graphApi.reducerPath]: graphApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      treeApi.middleware, // Changed from treeApi.middleware
      userApi.middleware,
      graphApi.middleware,
      authApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
