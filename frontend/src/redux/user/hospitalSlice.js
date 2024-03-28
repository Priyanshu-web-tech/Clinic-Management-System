import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentHospital: null,
  error: null,
  loading: false,
};

export const hospitalSlice = createSlice({
  name: "hospital",
  initialState,
  reducers: {
    signInHospitalStart: (state) => {
      state.loading = true;
    },
    signInHospitalSuccess: (state, action) => {
      state.currentHospital = action.payload;
      state.loading = false;
      state.error = null;
    },
    signInHospitalFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    signOutHospitalStart: (state) => {
      state.loading = true;
    },
    signOutHospitalSuccess: (state) => {
      state.currentHospital = null;
      state.loading = false;
      state.error = null;
    },
    signOutHospitalFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  signInHospitalStart,
  signInHospitalSuccess,
  signInHospitalFailure,
  signOutHospitalFailure,
  signOutHospitalSuccess,
  signOutHospitalStart,
} = hospitalSlice.actions;
export default hospitalSlice.reducer;
