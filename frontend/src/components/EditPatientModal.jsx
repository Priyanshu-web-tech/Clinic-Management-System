import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";

const EditPatientModal = ({
  patientDetails: {
    _id,
    name,
    occupation,
    phone,
    email,
    address,
    gender,
    maritalStatus,
  },
  onClose,
  onUpdatePatient,
  showAlertMessage,
}) => {
  const [formData, setFormData] = useState({
    name,
    occupation,
    phone,
    email,
    address,
    gender,
    maritalStatus,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(
        `/api/users/updateUser/${_id}`,
        formData
      );
      onUpdatePatient(formData); // Call the callback function with updated details
      onClose();

      showAlertMessage("Details Updated!");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-pale-white bg-opacity-50 flex justify-center items-center">
      <div className="bg-pale-white p-8 rounded-md border max-w-md w-full">
        <span className="cursor-pointer text-red" onClick={onClose}>
          <FaTimes size={25} />
        </span>
        <h2 className="text-3xl font-bold mb-4 text-center">
          Edit Patient Details
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label htmlFor="name" className="text-sm font-medium text-dark">
              Name
            </label>
            <input
              onChange={handleChange}
              type="text"
              id="name"
              name="name"
              value={formData.name}
              placeholder="Name"
              className="border border-gray rounded-md px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="occupation"
              className="text-sm font-medium text-dark"
            >
              Occupation
            </label>
            <input
              onChange={handleChange}
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              placeholder="Occupation"
              className="border border-gray rounded-md px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="phone" className="text-sm font-medium text-dark">
              Phone
            </label>
            <input
              onChange={handleChange}
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              placeholder="Phone"
              className="border border-gray rounded-md px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium text-dark">
              Email
            </label>
            <input
              onChange={handleChange}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              placeholder="Email"
              className="border border-gray rounded-md px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="address" className="text-sm font-medium text-dark">
              Address
            </label>
            <input
              onChange={handleChange}
              type="text"
              id="address"
              name="address"
              value={formData.address}
              placeholder="Address"
              className="border border-gray rounded-md px-3 py-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="gender" className="text-sm font-medium text-dark">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="border border-gray rounded-md px-3 py-2"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="maritalStatus"
              className="text-sm font-medium text-dark"
            >
              Marital Status
            </label>
            <select
              id="maritalStatus"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="border border-gray rounded-md px-3 py-2"
            >
              <option value="married">Married</option>
              <option value="unmarried">Unmarried</option>
              <option value="divorced">Divorced</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-dark w-full text-white py-2 px-4 rounded-md transition duration-300"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPatientModal;
