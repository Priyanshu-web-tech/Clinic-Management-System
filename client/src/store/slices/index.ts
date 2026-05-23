import { combineReducers } from "@reduxjs/toolkit";

import userDataReducer from "./userDataSlice";
import { apiSlice } from "../api/apiSlice";

const appReducer = combineReducers({
  userData: userDataReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

export default appReducer;