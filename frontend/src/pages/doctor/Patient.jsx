import React, { useState } from "react";
import axios from "axios";
import { calculateAge, baseURL } from "./../../utils";
import { useNavigate, useLoaderData, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Alert } from "./../../utils";

const Patient = () => {
  const { id } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const {
    name,
    occupation,
    phone,
    email,
    address,
    dob,
    gender,
    maritalStatus,
    queueNumber,
    queueDates,
    medicalHistory: initialMedicalHistory,
  } = useLoaderData();

  const navigate = useNavigate();
  const [medicalHistory, setMedicalHistory] = useState(initialMedicalHistory);
  const [newMedicalEntry, setNewMedicalEntry] = useState({
    date: new Date().toISOString().slice(0, 10), // Get current date
    remarks: "",
    prescription: "",
  });

  const showAlertMessage = (message, duration = 3000) => {
    setAlertMessage(message);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, duration);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedicalEntry({
      ...newMedicalEntry,
      [name]: value,
    });
  };

  const addMedicalEntry = () => {
    if (!newMedicalEntry.remarks) {
      showAlertMessage("Please fill in Remarks!");
      return; // Prevent submission if fields are empty
    }

    if (!newMedicalEntry.prescription) {
      showAlertMessage("Please Fill in Prescription!");
      return; // Prevent submission if fields are empty
    }
    const updatedMedicalHistory = [...medicalHistory, newMedicalEntry];
    axios
      .patch(
        `${baseURL}/api/users/updateUser/${id}`,
        { medicalHistory: updatedMedicalHistory },
        {
          headers: { "Content-Type": "application/json" },
        }
      )
      .then((response) => {
        if (response.data.acknowledged === true) {
          console.log("Medical History Updated Successfully");
          showAlertMessage("Added Successfully!");
          setMedicalHistory(updatedMedicalHistory); // Update medical history state
        }
      })
      .catch((error) => {
        console.error("Error updating medical history:", error);
      });
    setNewMedicalEntry({
      date: new Date().toISOString().slice(0, 10),
      remarks: "",
      prescription: "",
    });
  };

  const closeAppointment = () => {
    axios
      .patch(
        `${baseURL}/api/users/updateUser/${id}`,
        { queueNumber: 0, medStatus: "PENDING" },

        {
          headers: { "Content-Type": "application/json" },
        }
      )
      .then((response) => {
        if (response.data.acknowledged === true) {
          console.log("Queue Number Updated Successfully");
          navigate("/doctorHome");
        }
      })
      .catch((error) => {
        console.error("Error updating queue number:", error);
      });
  };

  const closeRequest = (userId) => {
    axios
      .patch(
        `${baseURL}/api/users/updateUser/${userId}`,
        { queueNumber: null, medStatus: "FULLFILLED" },
        {
          headers: { "Content-Type": "application/json" },
        }
      )
      .then((response) => {
        if (response.data.acknowledged === true) {
          console.log("Status Updated Successfully");

          navigate("/doctorHome");
        }
      })
      .catch((error) => {
        console.error("Error updating STATUS:", error);
      });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {showAlert && <Alert message={alertMessage} />}

      <h1 className="text-3xl font-bold text-gray-800 mb-6">Patient Details</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex">
          <span className="font-semibold mr-2">Name:</span>
          <span>{name}</span>
        </div>
        <div className="flex">
          <span className="font-semibold mr-2">Phone:</span>
          <span>{phone}</span>
        </div>
        <div className="flex">
          <span className="font-semibold mr-2">Email:</span>
          <span>{email}</span>
        </div>
        <div className="flex">
          <span className="font-semibold mr-2">Address:</span>
          <span>{address}</span>
        </div>
        <div className="flex">
          <span className="font-semibold mr-2">Date of Birth:</span>
          <span>{new Date(dob).toLocaleDateString("en-GB")}</span>
        </div>
        <div className="flex">
          <span className="font-semibold mr-2">Age:</span>
          <span>{calculateAge(dob)}</span>
        </div>
        <div className="flex">
          <span className="font-semibold mr-2">Occupation:</span>
          <span>{occupation}</span>
        </div>
        <div className="flex">
          <span className="font-semibold mr-2">Gender:</span>
          <span>{gender}</span>
        </div>
        <div className="flex">
          <span className="font-semibold mr-2">Marital Status:</span>
          <span>{maritalStatus}</span>
        </div>
        <div className="flex">
          <span className="font-semibold mr-2">Queue Number:</span>
          <span>{queueNumber}</span>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-2 mt-4">Medical History</h2>

        <div className="block w-full overflow-x-auto">
          {medicalHistory.length === 0 ? (
            <p>No Medical History Found</p>
          ) : (
            <table className="items-center bg-transparent w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Date
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Remarks
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Prescription
                  </th>
                </tr>
              </thead>
              <tbody>
                {medicalHistory.map((item, index) => (
                  <tr key={index}>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      {new Date(item.date).toLocaleDateString("en-GB")}{" "}
                    </td>

                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      {item.remarks}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      {item.prescription}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-8 space-x-3 space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Add New Medical Entry
        </h2>
        <input
          type="text"
          name="remarks"
          value={newMedicalEntry.remarks}
          onChange={handleInputChange}
          placeholder="Remarks"
          className="border border-gray-300 rounded-full p-3 mr-4 focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          name="prescription"
          value={newMedicalEntry.prescription}
          onChange={handleInputChange}
          placeholder="Prescription"
          className="border border-gray-300 rounded-full p-3 focus:outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={addMedicalEntry}
          disabled={currentUser.userRole !== "Doctor"}
          className={`bg-pale-white border hover:bg-dark text-dark hover:text-pale-white font-bold px-6 py-2 ml-2 rounded-full my-4 ${
            currentUser.userRole !== "Doctor" ? "cursor-not-allowed" : ""
          }`}
        >
          Add Medical Entry
        </button>
        <button
          type="button"
          onClick={closeAppointment}
          disabled={currentUser.userRole !== "Doctor"}
          className={`bg-pale-white border hover:bg-dark text-dark hover:text-pale-white font-bold px-6 py-2 ml-2 rounded-full my-4 ${
            currentUser.userRole !== "Doctor" ? "cursor-not-allowed" : ""
          }`}
        >
          Send for Medicine
        </button>

        <button
          type="button"
          onClick={() => closeRequest(id)} // Pass the user ID here
          disabled={currentUser.userRole !== "Doctor"}
          className={`bg-pale-white border hover:bg-dark text-dark hover:text-pale-white font-bold px-6 py-2 ml-2 rounded-full my-4 ${
            currentUser.userRole !== "Doctor" ? "cursor-not-allowed" : ""
          }`}
        >
          Close Request
        </button>
      </div>
    </div>
  );
};

export default Patient;
