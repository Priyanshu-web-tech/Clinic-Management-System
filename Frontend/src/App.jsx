import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signOutUserSuccess } from "./redux/user/userSlice";
import { signOutHospitalSuccess } from "./redux/user/hospitalSlice";
import axios from "axios";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/check-token`, {
          withCredentials: true, // This ensures cookies are sent
        });
        const data = res.data;
        if (data.success === false) {
          // Token is expired, dispatch sign out actions
          dispatch(signOutUserSuccess({}));
          dispatch(signOutHospitalSuccess({}));
        }
      } catch (error) {
        console.error("Error checking token validity:", error);
        // Handle error if necessary
      }
    };

    checkTokenValidity();
  }, []);

  return (
    <>
      <Outlet />
    </>
  );
};

export default App;
