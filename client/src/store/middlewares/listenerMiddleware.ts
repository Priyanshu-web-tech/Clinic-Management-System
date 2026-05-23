import {
  createListenerMiddleware,
  isPending,
  isRejected,
  isFulfilled,
} from "@reduxjs/toolkit";
import { startLoading, stopLoading } from "@/store/slices/loadingSlice";

export const listenerMiddleware = createListenerMiddleware();

// When ANY RTK Query request starts
listenerMiddleware.startListening({
  matcher: isPending(),
  effect: async (_action, api) => {
    api.dispatch(startLoading());
  },
});

// When ANY RTK Query request succeeds
listenerMiddleware.startListening({
  matcher: isFulfilled(),
  effect: async (_action, api) => {
    api.dispatch(stopLoading());
  },
});

// When ANY RTK Query request fails
listenerMiddleware.startListening({
  matcher: isRejected(),
  effect: async (_action, api) => {
    api.dispatch(stopLoading());
  },
});
