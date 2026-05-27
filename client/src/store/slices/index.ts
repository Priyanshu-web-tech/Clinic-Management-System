import { combineReducers } from "@reduxjs/toolkit";

import userDataReducer from "./user-data-slice";
import { apiSlice } from "../api/api-slice";

const appReducer = combineReducers({
  userData: userDataReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

export default appReducer;