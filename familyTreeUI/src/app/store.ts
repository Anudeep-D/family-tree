import { configureStore } from "@reduxjs/toolkit";
import { graphApi } from "@/redux/queries/graph-endpoints";
import { treeApi } from "@/redux/queries/tree-endpoints";
import { filterApi } from "@/redux/queries/filter-endpoints";
import { userApi } from "@/redux/queries/user-endpoints";
import { authApi } from "@/redux/queries/auth-endpoints";
import treeConfigReducer from "@/redux/treeConfigSlice";

export const store = configureStore({
  reducer: {
    treeConfig: treeConfigReducer, // Add the treeConfigSlice reducer
    [userApi.reducerPath]: userApi.reducer,
    [treeApi.reducerPath]: treeApi.reducer, // Changed from treeApi
    [graphApi.reducerPath]: graphApi.reducer,
    [filterApi.reducerPath]: filterApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      treeApi.middleware,
      userApi.middleware,
      graphApi.middleware,
      filterApi.middleware,
      authApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
