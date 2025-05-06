import { configureStore } from '@reduxjs/toolkit';
import { graphApi } from '@/redux/queries/graph-endpoints';

export const store = configureStore({
  reducer: {
    [graphApi.reducerPath]: graphApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(graphApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
