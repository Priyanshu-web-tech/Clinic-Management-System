import React from "react";
import { FaBarsStaggered, FaXmark } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

import {
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";

import {
  signOutHospitalStart,
  signOutHospitalSuccess,
  signOutHospitalFailure,
} from "../redux/user/hospitalSlice";

const Navbar = () => {
  const dispatch = useDispatch();

  let path;
  const { currentUser } = useSelector((state) => state.user);
  const { currentHospital } = useSelector((state) => state.hospital);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  if (currentUser) {
    if (currentUser.userRole === "Reception") path = "/receptionHome";
    else if (currentUser.userRole === "Doctor") path = "/doctorHome";
    else if (currentUser.userRole === "Inventory") path = "/inventoryHome";
    else path = "/*";
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/auth/signout`, {
        withCredentials: true, // This ensures cookies are sent
      });
      const data = res.data;
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      console.error("Error signing out:", error);
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleClinicSignOut = async () => {
    try {
      dispatch(signOutHospitalStart());
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/auth/signoutHospital`, {
        withCredentials: true, // This ensures cookies are sent
      });
      const data = res.data;
      if (data.success === false) {
        dispatch(signOutHospitalFailure(data.message));
        return;
      }
      dispatch(signOutHospitalSuccess(data));
      handleSignOut();
    } catch (error) {
      dispatch(signOutHospitalFailure(data.message));
    }
  };

  return (
    <div className="relative w-full p-2 bg-pale-white text-dark">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <div className="inline-flex items-center space-x-2">
          <Link to="/">
            <span className="font-bold text-2xl">DocMate</span>
          </Link>
        </div>
        <div className="hidden lg:block">
          <ul className="inline-flex space-x-8">
            {currentHospital && currentUser ? (
              <div className="space-x-4">
                <Link to={path} className="text-slate-400 hover:text-blue-400">
                  Home
                </Link>

                <button
                  onClick={handleClinicSignOut}
                  className="text-slate-400 hover:text-blue-400"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/clinicLogin"
                className="text-slate-400 hover:text-blue-400"
              >
                Sign in
              </Link>
            )}
          </ul>
        </div>
 
        <div className="lg:hidden">
          <div>
            <FaBarsStaggered
              onClick={toggleMenu}
              className="h-6 w-6 cursor-pointer"
            />
          </div>
        </div>
        {isMenuOpen && (
          <div className="absolute inset-x-0 top-0 z-50 origin-top-right  p-2  lg:hidden">
            <div className="divide-y-2 divide-gray-50 rounded-lg bg-pale-white text-dark  shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="px-5 pb-6 pt-5">
                <div className="flex items-center justify-between">
                  <div className="inline-flex  items-center space-x-2">
                    <Link to="/">
                      <span className="font-bold text-2xl">DocMate</span>
                    </Link>{" "}
                  </div>
                  <div className="-mr-2">
                    <button
                      type="button"
                      onClick={toggleMenu}
                      className="inline-flex items-center justify-center rounded-md p-2  hover:bg-pale-white hover:text-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black "
                    >
                      <span className="sr-only">Close menu</span>
                      <FaXmark className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="mt-6 flex">
                  <nav className="grid gap-y-4">
                    {currentHospital && currentUser ? (
                      <div className="flex flex-col">
                        <Link to={path}>
                          <button className="text-slate-400 hover:text-blue-400">
                            Home
                          </button>
                        </Link>
                        <button
                          onClick={handleClinicSignOut}
                          className="text-slate-400 hover:text-blue-400"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <Link to="/clinicLogin">
                        <button className="text-slate-400 hover:text-blue-400">
                          Sign in
                        </button>
                      </Link>
                    )}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
