import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useSelector, useDispatch } from "react-redux";

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
import { baseURL } from "../../utils";

const ClinicLogin = () => {
   
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({});
  const [hospitals, setHospitals] = useState([]);
  const { loading, error } = useSelector((state) => state.hospital);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/auth/getHospitals`);
        const hospitalsData = response.data;
        setHospitals(hospitalsData);
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      }
    };

    fetchHospitals();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInHospitalStart());
      const formDataClinic = {
        name: formData.name,
        accessCode: formData.accessCode,
      };

      const response = await axios.post(
        `${baseURL}/api/auth/loginHospital`,
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

        return;
      }
      dispatch(signInHospitalSuccess(data));

      try {
        dispatch(signInStart());
        const formDataUser = {
          hospitalName: formData.name,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        };

        const response = await axios.post(`${baseURL}/api/auth/login`, formDataUser, {
          headers: {
            "Content-Type": "application/json",
          },
        });

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
    } catch (error) {
      dispatch(signInHospitalFailure(error.message));
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
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-md border border-gray-300 rounded-md py-2 px-4"
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
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-md border border-gray-300 rounded-md py-2 px-4"
              />
            </div>
            {/* User Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-lg font-medium text-gray-800 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                onChange={handleChange}
                required
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-md border border-gray-300 rounded-md py-2 px-4"
              />
            </div>
            {/* Submit button */}
            <div>
              <button
                disabled={loading}
                type="submit"
                className="w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium bg-dark text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
          {error && <p className="text-red-500 mt-5 text-center">{error}</p>}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ClinicLogin;
