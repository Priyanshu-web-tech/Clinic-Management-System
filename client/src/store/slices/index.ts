import { combineReducers } from "@reduxjs/toolkit";

import userDataReducer from "./userDataSlice";
import loadingReducer from "./loadingSlice";
import { apiSlice } from "../api/apiSlice";

const appReducer = combineReducers({
  userData: userDataReducer,
  loading: loadingReducer, 
  [apiSlice.reducerPath]: apiSlice.reducer,
});

export default appReducer;