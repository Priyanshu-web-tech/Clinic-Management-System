import React, { useEffect, useState } from "react";
import axios from "axios";
import { calculateAge } from "./../../utils";
import { useNavigate, useLoaderData, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Alert } from "./../../utils";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import EditPatientModal from "../../components/EditPatientModal";

const Patient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showEditModal, setShowEditModal] = useState(false);

  const {
    _id,
    name: initialName,
    occupation: initialOccupation,
    phone: initialPhone,
    email: initialEmail,
    address: initialAddress,
    dob,
    gender: initialGender,
    maritalStatus: initialMaritalStatus,
    queueNumber,
    queueDates,
    medicalHistory: initialMedicalHistory,
  } = useLoaderData();

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail);
  const [address, setAddress] = useState(initialAddress);
  const [gender, setGender] = useState(initialGender);
  const [maritalStatus, setMaritalStatus] = useState(initialMaritalStatus);
  const [occupation, setOccupation] = useState(initialOccupation);
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

  const updatePatientDetails = (updatedDetails) => {
    // Update the state with the updated details
    setName(updatedDetails.name);
    setOccupation(updatedDetails.occupation);
    setPhone(updatedDetails.phone);
    setEmail(updatedDetails.email);
    setAddress(updatedDetails.address);
    setGender(updatedDetails.gender);
    setMaritalStatus(updatedDetails.maritalStatus);
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
        `/api/users/updateUser/${id}`,
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
        `/api/users/updateUser/${id}`,
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
        `/api/users/updateUser/${userId}`,
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

  const totalPages = Math.ceil(medicalHistory.length / itemsPerPage);

  // Function to handle next page
  const nextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  // Function to handle previous page
  const prevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  // Function to handle pagination click
  const handleClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Slice the medicalHistory array based on current page and items per page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const reversedMedicalHistory = [...medicalHistory].reverse();

  const currentItems = reversedMedicalHistory.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className="m-2">
      {showAlert && <Alert message={alertMessage} />}
      {showEditModal && (
        <EditPatientModal
          patientDetails={{
            _id,
            name,
            occupation,
            phone,
            email,
            address,
            gender,
            maritalStatus,
          }}
          showAlertMessage={showAlertMessage}
          onUpdatePatient={updatePatientDetails}
          onClose={() => setShowEditModal(false)}
        />
      )}
      <div className="p-3 bg-pale-white rounded-lg flex justify-between items-center">
        <h1 className="text-3xl font-bold">Patient Details</h1>

        <div>
          <Link to={`/doctorHome`}>
            <button
              type="button"
              className="bg-transparent mt-2  text-dark border hover:bg-dark hover:text-pale-white transition-all duration-300 font-bold px-4 py-2 rounded-full "
            >
              Go back
            </button>{" "}
          </Link>
          <button
            type="button"
            className="bg-transparent mt-2  text-dark border hover:bg-dark hover:text-pale-white transition-all duration-300 font-bold px-4 py-2 rounded-full "
            onClick={() => setShowEditModal(true)}
          >
            Edit Details
          </button>
        </div>
      </div>
      <hr />

      {/* Basic Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
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
          <span className="font-semibold mr-2">Marital Status:</span>
          <span>{maritalStatus}</span>
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
          <span className="font-semibold mr-2">Age:</span>
          <span>{calculateAge(dob)}</span>
        </div>

        <div className="flex">
          <span className="font-semibold mr-2">Queue Number:</span>
          <span>{queueNumber}</span>
        </div>
      </div>

      {/* Medical History */}
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-2">Medical History</h2>

        <div className="block w-full overflow-x-auto min-h-60">
          {currentItems.length === 0 ? (
            <p>No Medical History Found</p>
          ) : (
            <table className="items-center bg-transparent w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-2 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Date
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-2 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Remarks
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-2 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Prescription
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr
                    key={index}
                    className="transition-all duration-300 hover:font-bold hover:bg-pale-white "
                  >
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-3 text-left">
                      {new Date(item.date).toLocaleDateString("en-GB")}{" "}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-3 text-left">
                      {item.remarks}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-3 text-left">
                      {item.prescription}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-3">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="bg-transparent hover:bg-dark text-dark hover:text-pale-white border font-bold
              px-3 py-2 rounded-md"
          >
            <FaChevronLeft />
          </button>
          <div className="space-x-1">
            {[...Array(totalPages).keys()].map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handleClick(pageNumber + 1)}
                className={`${
                  currentPage === pageNumber + 1
                    ? "bg-dark text-pale-white"
                    : "bg-transparent hover:bg-dark text-dark hover:text-pale-white"
                } border font-bold p-2 rounded-md`}
              >
                {pageNumber + 1}
              </button>
            ))}
          </div>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="bg-transparent hover:bg-dark text-dark hover:text-pale-white border font-bold px-3 py-2 rounded-md"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4">
        <h2 className="text-2xl font-semibold ">Add New Medical Entry</h2>
        {/* inputs and buttons */}
        <div className="lg:flex-row lg:gap-3 flex flex-col ">
          <input
            type="text"
            name="remarks"
            value={newMedicalEntry.remarks}
            onChange={handleInputChange}
            placeholder="Remarks"
            className="border  rounded-full px-2 py-2 lg:my-4  my-2"
          />
          <input
            type="text"
            name="prescription"
            value={newMedicalEntry.prescription}
            onChange={handleInputChange}
            placeholder="Prescription"
            className="border  rounded-full px-2 py-2  lg:my-4  my-2 "
          />
          <button
            type="button"
            onClick={addMedicalEntry}
            disabled={currentUser.userRole !== "Doctor"}
            className={`bg-pale-white border hover:bg-dark text-dark hover:text-pale-white font-bold px-6 
            py-2 rounded-full lg:my-4  my-2 ${
              currentUser.userRole !== "Doctor" ? "cursor-not-allowed" : ""
            }`}
          >
            Add Medical Entry
          </button>
          <button
            type="button"
            onClick={closeAppointment}
            disabled={currentUser.userRole !== "Doctor"}
            className={`bg-pale-white border hover:bg-dark text-dark hover:text-pale-white font-bold px-6 py-2  rounded-full lg:my-4  my-2 ${
              currentUser.userRole !== "Doctor" ? "cursor-not-allowed" : ""
            }`}
          >
            Send for Medicine
          </button>

          <button
            type="button"
            onClick={() => closeRequest(id)} // Pass the user ID here
            disabled={currentUser.userRole !== "Doctor"}
            className={`bg-pale-white border hover:bg-dark text-dark hover:text-pale-white font-bold px-6 py-2  rounded-full lg:my-4  my-2 ${
              currentUser.userRole !== "Doctor" ? "cursor-not-allowed" : ""
            }`}
          >
            Close Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default Patient;
