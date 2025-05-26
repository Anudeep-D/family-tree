import { configureStore } from '@reduxjs/toolkit';
import { graphApi } from '@/redux/queries/graph-endpoints';
import { authApi } from '@/redux/queries/auth-endpoints';

export const store = configureStore({
  reducer: {
    [graphApi.reducerPath]: graphApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(graphApi.middleware, authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
