import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri"; // Import icons from React Icons
import { Alert } from "../utils";

import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
} from "../redux/user/userSlice";

const Profile = () => {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const showAlertMessage = (message, duration = 3000) => {
    setAlertMessage(message);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, duration);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/reception/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      showAlertMessage("Updated Successfully!");
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      showAlertMessage("Error in updating!");
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/reception/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        showAlertMessage(`${data.message}`);

        return;
      }
      dispatch(deleteUserSuccess(data));
      showAlertMessage(`Deleted Successfully`);
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
      showAlertMessage(`Error in deleting user`);
    }
  };

  return (
    <div>
      {showAlert && <Alert message={alertMessage} />}

      <div>
        <h1 className="text-3xl font-bold mb-4 bg-pale-white p-4 rounded-lg">
          Manage Profile
        </h1>
        <hr />
      </div>

      <div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 items-center"
        >
          {/* Input fields  */}
          <div className="flex flex-col gap-2 w-full">
            <div>
              <label htmlFor="name" className="text-sm font-semibold">
                Name
              </label>
              <input
                type="text"
                placeholder="name"
                defaultValue={currentUser.name}
                id="name"
                className="border p-3  text-black rounded-lg w-full"
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="text-sm font-semibold">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="phoneNumber"
                defaultValue={currentUser.phoneNumber}
                id="phoneNumber"
                className="border p-3 text-black rounded-lg w-full"
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="text-sm font-semibold">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="password"
                onChange={handleChange}
                id="password"
                className="border p-3  text-black  rounded-lg w-full"
              />

              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute  inset-y-7 right-0 px-3 py-2 text-teal-800 focus:outline-none"
              >
                {showPassword ? (
                  <RiEyeOffFill size={24} />
                ) : (
                  <RiEyeFill size={24} />
                )}
              </button>
            </div>

            <button
              disabled={loading}
              className="bg-dark text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
            >
              {loading ? "Loading..." : "Update"}
            </button>

            <button
              onClick={handleDeleteUser}
              className="bg-dark text-white rounded-lg py-3 uppercase hover:opacity-95"
            >
              Delete Account
            </button>
          </div>
        </form>

        {/* Display error messages */}
        <p className="text-red mt-5">{error ? error : ""}</p>
      </div>
    </div>
  );
};

export default Profile;
