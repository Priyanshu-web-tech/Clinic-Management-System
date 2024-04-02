import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri"; // Import icons from React Icons
import { Alert } from "../utils";
import axios from "axios";

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
  const [errors, setErrors] = useState({});

  const validateInput = (name, value) => {
    switch (name) {
      case "name":
        return /^[A-Za-z\s]+$/.test(value)
          ? ""
          : "Name must contain only alphabets";
      case "phoneNumber":
        return /^\d{0,10}$/.test(value)
          ? ""
          : "Phone number must contain only numbers & should be 10 digits ";
      case "password":
        // Password strength check
        if (value.length < 8) {
          return "Password must be at least 8 characters long";
        } else if (!/[a-z]/.test(value)) {
          return "Password must contain at least one lowercase letter";
        } else if (!/[A-Z]/.test(value)) {
          return "Password must contain at least one uppercase letter";
        } else if (!/\d/.test(value)) {
          return "Password must contain at least one digit";
        } else {
          return "";
        }
      default:
        return "";
    }
  };

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
    const { id, value } = e.target;
    const errorMessage = validateInput(id, value);
    setErrors({
      ...errors,
      [id]: errorMessage,
    });

    if (!errorMessage || value === "") {
      setErrors({
        ...errors,
        [id]: "", // Reset error message when input becomes valid
      });
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if there are any errors in the form
    if (Object.values(errors).some((error) => error !== "")) {
      return; // Stop form submission if there are errors
    }

    // Remove password field from formData if it is empty
    const updatedFormData = { ...formData };
    if (formData.password === "") {
      delete updatedFormData.password;
    }

    try {
      dispatch(updateUserStart());
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/reception/update/${currentUser._id}`,
        updatedFormData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = res.data;
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
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/reception/delete/${currentUser._id}`,
        {
          withCredentials: true,
        }
      );
      const data = res.data;
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        showAlertMessage(`${data.message}`);
        return;
      }
      dispatch(deleteUserSuccess(data));
      showAlertMessage(`Deleted Successfully`);
    } catch (error) {
      console.error("Error in deleting user:", error);
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
                required
                defaultValue={currentUser.name}
                id="name"
                className={`appearance-none block w-full   border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white ${
                  errors.name ? "border-red" : ""
                }`}
                onChange={handleChange}
              />

              {errors.name && (
                <p className="text-red-500 text-xs italic">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="phoneNumber" className="text-sm font-semibold">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="phoneNumber"
                required
                defaultValue={currentUser.phoneNumber}
                id="phoneNumber"
                className={`appearance-none block w-full   border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white ${
                  errors.phoneNumber ? "border-red" : ""
                }`}
                onChange={handleChange}
              />

              {errors.phoneNumber && (
                <p className="text-red-500 text-xs italic">
                  {errors.phoneNumber}
                </p>
              )}
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
                className={`appearance-none block w-full   border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white ${
                  errors.password ? "border-red" : ""
                }`}
              />

              {errors.password && (
                <p className="text-red-500 text-xs italic">{errors.password}</p>
              )}

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
