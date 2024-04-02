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

  const [errors, setErrors] = useState({});

  const validateInput = (name, value) => {
    switch (name) {
      case "name":
        return /^[A-Za-z\s]+$/.test(value)
          ? ""
          : "Name must contain only alphabets";
      case "phone":
        return /^\d{0,10}$/.test(value)
          ? ""
          : "Phone number must contain only numbers & should be 10 digits ";
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
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(errors).some((error) => error !== "")) {
      return; // Stop form submission if there are errors
    }
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
        <form className="space-y-1" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block uppercase tracking-wide  text-xs font-bold mb-1"
            >
              Name
            </label>
            <input
              onChange={handleChange}
              type="text"
              id="name"
              name="name"
              value={formData.name}
              required
              placeholder="Name"
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
              htmlFor="occupation"
              className="block uppercase tracking-wide  text-xs font-bold mb-1"
            >
              Occupation
            </label>
            <input
              onChange={handleChange}
              required
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              placeholder="Occupation"
              className="appearance-none block w-full   border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block uppercase tracking-wide  text-xs font-bold mb-1"
            >
              Phone
            </label>
            <input
              onChange={handleChange}
              pattern="[1-9]{1}[0-9]{9}"
              required
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              placeholder="Phone"
              className={`appearance-none block w-full    border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white ${
                errors.phone ? "border-red" : ""
              }`}
            />

            {errors.phone && (
              <p className="text-red-500 text-xs italic">{errors.phone}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block uppercase tracking-wide  text-xs font-bold mb-1"
            >
              Email
            </label>
            <input
              onChange={handleChange}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              placeholder="Email"
              className={`appearance-none block w-full    border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white `}
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block uppercase tracking-wide  text-xs font-bold mb-1"
            >
              Address
            </label>
            <input
              onChange={handleChange}
              required
              type="text"
              id="address"
              name="address"
              value={formData.address}
              placeholder="Address"
              className="appearance-none block w-full   border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="gender"
              className="block uppercase tracking-wide  text-xs font-bold mb-1"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              required
              onChange={handleChange}
              className="appearance-none block w-full   border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="maritalStatus"
              className="block uppercase tracking-wide  text-xs font-bold mb-1"
            >
              Marital Status
            </label>
            <select
              id="maritalStatus"
              name="maritalStatus"
              value={formData.maritalStatus}
              required
              onChange={handleChange}
              className="appearance-none block w-full   border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
            >
              <option value="married">Married</option>
              <option value="unmarried">Unmarried</option>
              <option value="divorced">Divorced</option>
            </select>
          </div>
          <br />
          <button
            type="submit"
            className="bg-dark w-full text-white px-1 py-3  rounded-md "
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPatientModal;
