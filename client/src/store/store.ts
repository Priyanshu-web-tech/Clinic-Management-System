
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistReducer, persistStore } from "redux-persist";
import storage from 'redux-persist/lib/storage';

import { apiSlice } from "./api/api-slice";
import appReducer from "./slices";

const persistConfig = {
  key: "root",
  version: 1,
  storage: storage,
  whitelist: ["userData"],
};

const persistedReducer = persistReducer(persistConfig, appReducer) as unknown as typeof appReducer;

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
    .concat(apiSlice.middleware)
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;