import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signOutUserSuccess } from "./redux/user/userSlice";
import { signOutHospitalSuccess } from "./redux/user/hospitalSlice";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        const res = await fetch("/api/check-token");
        const data = await res.json();
        if (data.success===false) {
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
