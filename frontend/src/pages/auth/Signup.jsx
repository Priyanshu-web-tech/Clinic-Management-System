import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInFailure,
  signInSuccess,
} from "../../redux/user/userSlice";

import {
  signInHospitalStart,
  signInHospitalFailure,
  signInHospitalSuccess,
} from "../../redux/user/hospitalSlice";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";

const Signup = () => {
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [hospitals, setHospitals] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const { loading: hospitalLoading, error: hospitalError } = useSelector(
    (state) => state.hospital
  );
  const { loading: userLoading, error: userError } = useSelector(
    (state) => state.user
  );
  const loading = hospitalLoading || userLoading;
  const error = hospitalError || userError;

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
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await axios.get(`/api/auth/getHospitals`);
        const hospitalsData = response.data;
        setHospitals(hospitalsData);
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      }
    };

    fetchHospitals();
  }, []);

  const hospitalAuthenticateAndLogin = async (formData, dispatch) => {
    try {
      const formDataClinic = {
        name: formData.hospitalName,
        accessCode: formData.accessCode,
      };
      const response = await axios.post(
        `/api/auth/loginHospital`,
        formDataClinic,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (data.success === false) {
        dispatch(signInHospitalFailure(data.message));
        return null;
      }

      dispatch(signInHospitalSuccess(data));
      return data;
    } catch (error) {
      dispatch(signInHospitalFailure(error.message));
      return null;
    }
  };

  const userSignUp = async (formData, dispatch) => {
    try {
      const formDataUser = {
        name: formData.name,
        password: formData.password,
        hospitalName: formData.hospitalName,
        phoneNumber: formData.phoneNumber,
        userRole: formData.userRole,
      };

      const registerResponse = await axios.post(
        `/api/auth/register`,
        formDataUser,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const registerData = registerResponse.data;

      if (registerData.success === false) {
        return null;
      }

      return registerData;
    } catch (error) {
      console.log("Error in Sign up", error);
      return null;
    }
  };

  const userSignIn = async (formData, dispatch, navigate) => {
    try {
      dispatch(signInStart());
      const formDataUserSignIn = {
        hospitalName: formData.hospitalName,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      };

      const response = await axios.post(
        `/api/auth/login`,
        formDataUserSignIn,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }

      dispatch(signInSuccess(data));
      if (data.userRole === "Doctor") navigate("/doctorHome");
      else if (data.userRole === "Reception") navigate("/receptionHome");
      else if (data.userRole === "Inventory") navigate("/inventoryHome");
      else navigate("/*");
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(errors).some((error) => error !== "")) {
      return; // Stop form submission if there are errors
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({
        ...errors,
        confirmPassword: "Passwords do not match",
      });
      return;
    }

    try {
      const hospitalData = await hospitalAuthenticateAndLogin(
        formData,
        dispatch,
      );
      if (!hospitalData) return;

      const signUpData = await userSignUp(formData, dispatch);
      if (!signUpData) return;

      await userSignIn(formData, dispatch, navigate);
    } catch (error) {
      console.error("Error during Sign up:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full sm:w-96">
          <h2 className="text-4xl font-semibold text-center text-indigo-600 mb-6">
            Create an Account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Choose Hospital */}
            <div>
              <label
                htmlFor="hospitalName"
                className="block text-lg font-medium text-gray-800 mb-1"
              >
                Choose Hospital:
              </label>

              <select
                className="mt-1  block w-full shadow-md border border-gray-300 rounded-md py-2 px-4"
                required
                onChange={handleChange}
                id="hospitalName"
                name="hospitalName"
              >
                <option value="">Choose hospital</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.name} value={hospital.name}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Enter Access Code */}
            <div>
              <label
                htmlFor="accessCode"
                className="block text-lg font-medium text-gray-800 mb-1"
              >
                Access Code
              </label>
              <input
                type="password"
                id="accessCode"
                name="accessCode"
                onChange={handleChange}
                required
                className="mt-1  block w-full shadow-md border border-gray-300 rounded-md py-2 px-4"
              />
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-lg font-medium text-gray-800 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                onChange={handleChange}
                autoComplete="name"
                required
                className={`appearance-none block w-full   border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white ${
                  errors.name ? "border-red" : ""
                }`}
              />

              {errors.name && (
                <p className="text-red-500 text-xs italic">{errors.name}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-lg font-medium text-gray-800 mb-1"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                onChange={handleChange}
                autoComplete="phoneNumber"
                pattern="[1-9]{1}[0-9]{9}"
                required
                className={`appearance-none block w-full   border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white ${
                  errors.phoneNumber ? "border-red" : ""
                }`}
              />

              {errors.phoneNumber && (
                <p className="text-red-500 text-xs italic">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="userRole"
                className="block text-lg font-medium text-gray-800 mb-1"
              >
                Role:
              </label>

              <select
                className="mt-1  block w-full shadow-md border border-gray-300 rounded-md py-2 px-4"
                required
                onChange={handleChange}
                id="userRole"
                name="userRole"
              >
                <option value="">Choose your Role </option>
                <option value="Doctor">Doctor</option>
                <option value="Reception">Reception</option>
                <option value="Inventory">Inventory</option>
              </select>
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-lg font-medium text-gray-800 mb-1"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                onChange={handleChange}
                required
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
                className="absolute  inset-y-8 right-0 px-3 py-2 text-teal-800 focus:outline-none"
              >
                {showPassword ? (
                  <RiEyeOffFill size={24} />
                ) : (
                  <RiEyeFill size={24} />
                )}
              </button>
            </div>

            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-lg font-medium text-gray-800 mb-1"
              >
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                onChange={handleChange}
                required
                className={`appearance-none block w-full   border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white ${
                  errors.confirmPassword ? "border-red" : ""
                }`}
              />

              {errors.confirmPassword && (
                <p className="text-red-500 text-xs italic">
                  {errors.confirmPassword}
                </p>
              )}

              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute  inset-y-8 right-0 px-3 py-2 text-teal-800 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <RiEyeOffFill size={24} />
                ) : (
                  <RiEyeFill size={24} />
                )}
              </button>
            </div>

            <div>
              <button
                disabled={loading}
                type="submit"
                className="w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium bg-dark text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? "Loading..." : "Sign Up"}
              </button>
            </div>
          </form>
          <Link
            to="/clinicLogin"
            className="text-lg text-center mt-4 text-indigo-600 block hover:underline"
          >
            Already have an account? Login now.
          </Link>
          {error && <p className="text-red mt-5">{error}</p>}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Signup;
