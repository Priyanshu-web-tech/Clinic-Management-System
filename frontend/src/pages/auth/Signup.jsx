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
import { baseURL } from "../../utils";

const Signup = () => {
   

  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [hospitals, setHospitals] = useState([]);

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
      setLoading(true);

      const formDataClinic = {
        name: formData.hospitalName,
        accessCode: formData.accessCode,
      };

      // Authenticate Hospital & Sign in
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
        return;
      }

      const formDataUser = {
        name: formData.name,
        password: formData.password,
        hospitalName: formData.hospitalName,
        phoneNumber: formData.phoneNumber,
        userRole: formData.userRole,
      };

      const registerResponse = await axios.post(
        `${baseURL}/api/auth/register`,
        formDataUser,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const registerData = registerResponse.data;

      if (registerData.success === false) {
        setLoading(false);
        setError(registerData.message);
        return;
      }
      setLoading(false);
      setError(null);

      // NOW SIGN IN:

      try {
        dispatch(signInHospitalStart());
     
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
          const formDataUserSignIn = {
            hospitalName: formData.hospitalName,
            phoneNumber: formData.phoneNumber,
            password: formData.password,
          };
  
          const response = await axios.post(`${baseURL}/api/auth/login`, formDataUserSignIn, {
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          const data = response.data;
          console.log(data);
  
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


    } catch (error) {
      setLoading(false);
      setError(error.message);
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
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-md border border-gray-300 rounded-md py-2 px-4"
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
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-md border border-gray-300 rounded-md py-2 px-4"
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
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-md border border-gray-300 rounded-md py-2 px-4"
              />
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
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-md border border-gray-300 rounded-md py-2 px-4"
              />
            </div>
            <div>
              <label
                htmlFor="userRole"
                className="block text-lg font-medium text-gray-800 mb-1"
              >
                Role:
              </label>

              <select
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-md border border-gray-300 rounded-md py-2 px-4"
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
          {error && <p className="text-red-500 mt-5">{error}</p>}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Signup;