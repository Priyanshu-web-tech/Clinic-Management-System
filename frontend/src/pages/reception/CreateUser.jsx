import React, { useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Alert, baseURL } from "../../utils";

const CreateUser = () => {
  const [formData, setFormData] = useState({});
  const { currentHospital } = useSelector((state) => state.hospital);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const showAlertMessage = (message, duration = 3000) => {
    setAlertMessage(message);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, duration);
  };

  const validateInput = (name, value) => {
    switch (name) {
      case "name":
        return /^[A-Za-z\s]+$/.test(value)
          ? ""
          : "Name must contain only alphabets";
      case "phone":
        return /^\d{0,10}$/.test(value) ? "" : "Phone number must be 10 digits";
      // Add more validations for other fields as necessary
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ""
          : "Enter a valid email address";
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
    if (!errorMessage) {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formValid = Object.keys(formData).every(
      (key) => validateInput(key, formData[key]) === ""
    );

    if (!formValid) {
      return;
    }

    formData.hospitalName = currentHospital.name;
    try {
      const registerResponse = await axios.post(
        `${baseURL}/api/users/createUser`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const registerData = registerResponse.data;
      console.log(registerData);

      if (registerData.statusCode === 400) {
        showAlertMessage(registerData.message);
        return;
      }

      if (registerData.success === false) {
        showAlertMessage(registerData.message);
        return;
      }
      showAlertMessage("Patient Created Successfully!");
      setFormData({}); // Clear form fields
      formRef.current.reset(); // Reset form
    } catch (error) {
      console.log("hi");
      console.log(error);
    }
  };

  return (
    <div className="container mx-auto">
      {showAlert && <Alert message={alertMessage} />}

      <h1 className="text-3xl font-semibold text-center p-4 bg-pale-white rounded-lg mb-4">
        New Patient Registration
      </h1>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className=" rounded px-4 pt-3 pb-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label
              className="block uppercase tracking-wide  text-xs font-bold mb-2"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              name="name"
              onChange={handleChange}
              className={`appearance-none block w-full   border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white ${
                errors.name ? "border-red" : ""
              }`}
              id="name"
              type="text"
              required
              placeholder="Enter Name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs italic">{errors.name}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block uppercase tracking-wide   text-xs font-bold mb-2"
              htmlFor="phone"
            >
              Phone Number
            </label>
            <input
              name="phone"
              onChange={handleChange}
              className={`appearance-none block w-full    border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white ${
                errors.phone ? "border-red" : ""
              }`}
              id="phone"
              type="text"
              placeholder="xxx-xxxx-xxx"
              required
            />
            {errors.phone && (
              <p className="text-red-500 text-xs italic">{errors.phone}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block uppercase tracking-wide  text-xs font-bold mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              className={`appearance-none block w-full    border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white ${
                errors.email ? "border-red" : ""
              }`}
              id="email"
              type="text"
              placeholder="Enter Email Id"
              onChange={handleChange}
              name="email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic">{errors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block uppercase tracking-wide  text-xs font-bold mb-2"
              htmlFor="occupation"
            >
              Occupation
            </label>
            <input
              className="appearance-none block w-full bg-gray-200  border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="occupation"
              type="text"
              placeholder="Enter Service"
              onChange={handleChange}
              required
              name="occupation"
            />
          </div>
          <div className="mb-4">
            <label
              className="block uppercase tracking-wide  text-xs font-bold mb-2"
              htmlFor="address"
            >
              Address
            </label>
            <input
              className="appearance-none block w-full bg-gray-200  border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="address"
              type="text"
              placeholder="Enter Address"
              onChange={handleChange}
              required
              name="address"
            />
          </div>
          <div className="mb-4">
            <label
              className="block uppercase tracking-wide  text-xs font-bold mb-2"
              htmlFor="dob"
            >
              DOB
            </label>
            <div className="relative">
              <input
                className="block appearance-none w-full bg-gray-200 border border-gray-200  py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                type="date"
                id="dob"
                onChange={handleChange}
                required
                name="dob"
              />
            </div>
          </div>
          <div className="mb-4">
            <label
              className="block uppercase tracking-wide  text-xs font-bold mb-2"
              htmlFor="gender"
            >
              Gender
            </label>
            <div className="relative">
              <select
                className="block  w-full bg-gray-200 border border-gray-200  py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="gender"
                onChange={handleChange}
                required
                name="gender"
              >
                <option value="">Choose your gender </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">others</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label
              className="block uppercase tracking-wide  text-xs font-bold mb-2"
              htmlFor="maritalStatus"
            >
              Marital Status
            </label>
            <div className="relative">
              <select
                className="block  w-full bg-gray-200 border border-gray-200  py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="maritalStatus"
                onChange={handleChange}
                name="maritalStatus"
              >
                <option value="">Choose your Status </option>
                <option value="married">married</option>
                <option value="unmarried">unmarried</option>
                <option value="divorced">divorced</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-pale-white border rounded-md hover:bg-dark hover:text-white flex items-center justify-center">
          <button
            className=" w-full md:w-auto font-bold p-4 transition-all duration-300 rounded-full"
            type="submit"
          >
            Create User
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;
