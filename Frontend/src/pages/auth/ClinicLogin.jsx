import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useSelector, useDispatch } from "react-redux";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri"; // Import icons from React Icons

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

const ClinicLogin = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({});
  const [hospitals, setHospitals] = useState([]);
  const { loading: hospitalLoading, error: hospitalError } = useSelector(
    (state) => state.hospital
  );
  const { loading: userLoading, error: userError } = useSelector(
    (state) => state.user
  );
  const loading = hospitalLoading || userLoading;
  const error = hospitalError || userError;
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/auth/getHospitals`, {
          withCredentials: true, 
        });
        const hospitalsData = response.data;
        setHospitals(hospitalsData);
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      }
    };

    fetchHospitals();
  }, []);

  useEffect(() => {
    // Clear errors when the component mounts
    dispatch(signInHospitalFailure(null));
    dispatch(signInFailure(null));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const hospitalLogin = async (formData, dispatch) => {
    try {
      const formDataClinic = {
        name: formData.name,
        accessCode: formData.accessCode,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/loginHospital`,
        formDataClinic,
        {
          withCredentials: true,
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
      return data.name; // Assuming name is returned upon successful login
    } catch (error) {
      dispatch(signInHospitalFailure(error.message));
      return null;
    }
  };

  const userLogin = async (formData, dispatch, navigate) => {
    try {
      const formDataUser = {
        hospitalName: formData.name,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/login`,
        formDataUser,
        {
          withCredentials:true,
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
    try {
      dispatch(signInHospitalStart());
      const hospitalName = await hospitalLogin(formData, dispatch);

      if (hospitalName) {
        dispatch(signInStart());
        await userLogin(formData, dispatch, navigate);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full sm:w-96">
          <h2 className="text-4xl font-semibold text-center text-indigo-600 mb-6">
            Welcome Back!
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Choose Hospital */}
            <div>
              <label
                htmlFor="name"
                className="block text-lg font-medium text-gray-800 mb-1"
              >
                Choose Hospital:
              </label>

              <select
                className="mt-1 focus:ring-dark focus:border-dark block w-full shadow-md border border-dark rounded-md py-2 px-4"
                required
                onChange={handleChange}
                id="name"
                name="name"
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
                className="block text-lg font-medium text-dark mb-1"
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
            {/* Phone number */}
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
                className="mt-1  block w-full shadow-md border border-gray-300 rounded-md py-2 px-4"
              />
            </div>
            {/* User Password */}
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
                className="mt-1  block w-full shadow-md border border-gray-300 rounded-md py-2 px-4"
              />
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
            {/* Submit button */}
            <div>
              <button
                disabled={loading}
                type="submit"
                className="w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium bg-dark text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 "
              >
                {loading ? "Loading..." : "Log In"}
              </button>
            </div>
          </form>

          <Link
            to="/register"
            className="text-lg text-center mt-4 text-indigo-600 block hover:underline"
          >
            Don't have an account? Register now.
          </Link>
          {error && <p className="text-red mt-5 text-center">{error}</p>}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ClinicLogin;
