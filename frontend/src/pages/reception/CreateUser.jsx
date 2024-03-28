import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { baseURL } from "../../utils";

const CreateUser = () => {
  const [formData, setFormData] = useState({});
  const { currentHospital } = useSelector((state) => state.hospital);
   


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    formData.hospitalName = currentHospital.name;
    console.log(formData);
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

      if (registerData.success === false) {
        return;
      }
      alert("User Created Successfully");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-semibold text-center p-4 bg-pale-white rounded-lg mb-4">
        New Patient Registration
      </h1>

      <form
        onSubmit={handleSubmit}
        className=" rounded px-4 pt-3 pb-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              name="name"
              onChange={handleChange}
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
              id="name"
              type="text"
              placeholder="Enter Name"
            />
          </div>
          <div className="mb-4">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="phone"
            >
              Phone Number
            </label>
            <input
              name="phone"
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="phone"
              type="text"
              placeholder="xxx-xxxx-xxx"
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
              id="email"
              type="text"
              placeholder="Enter Email Id"
              onChange={handleChange}
              name="email"
            />
          </div>
          <div className="mb-4">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="occupation"
            >
              Occupation
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="occupation"
              type="text"
              placeholder="Enter Service"
              onChange={handleChange}
              name="occupation"
            />
          </div>
          <div className="mb-4">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="address"
            >
              Address
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="address"
              type="text"
              placeholder="Enter Address"
              onChange={handleChange}
              name="address"
            />
          </div>
          <div className="mb-4">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="dob"
            >
              DOB
            </label>
            <div className="relative">
              <input
                className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                type="date"
                id="dob"
                onChange={handleChange}
                name="dob"
              />
            </div>
          </div>
          <div className="mb-4">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="gender"
            >
              Gender
            </label>
            <div className="relative">
              <select
                className="block  w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="gender"
                onChange={handleChange}
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
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="maritalStatus"
            >
              Marital Status
            </label>
            <div className="relative">
              <select
                className="block  w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
            className=" w-full md:w-auto font-bold py-2 px-4 rounded-full"
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
