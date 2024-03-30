import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Alert, baseURL } from "../utils";
import {
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Appointments = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentHospital } = useSelector((state) => state.hospital);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const showAlertMessage = (message, duration = 3000) => {
    setAlertMessage(message);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, duration);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/api/users/getUsers/${currentHospital.name}`
      );

      const sortedUsers = response.data.sort((a, b) => {
        if (a.queueNumber === null && b.queueNumber === null) return 0;
        if (a.queueNumber === null) return 1;
        if (b.queueNumber === null) return -1;
        if (a.queueNumber === 0) return 1;
        if (b.queueNumber === 0) return -1;
        return a.queueNumber - b.queueNumber;
      });

      setUsers(sortedUsers);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentHospital]);

  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(users.length / itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const openDeleteConfirmation = (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirmation(true);
  };

  const closeDeleteConfirmation = () => {
    setUserToDelete(null);
    setShowDeleteConfirmation(false);
  };

  const deleteUser = (userId) => {
    axios
      .delete(`${baseURL}/api/users/deleteUser/${userId}`, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        if (response.data.acknowledged === true) {
          console.log("Patient Deleted Successfully");
          fetchUsers();
        }
      })
      .catch((error) => {
        console.error("Error Deleting User:", error);
      })
      .finally(() => {
        closeDeleteConfirmation();
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
          fetchUsers(); // Fetch users after updating
        }
      })
      .catch((error) => {
        console.error("Error updating STATUS:", error);
      });
  };
  const closeAllRequests = () => {
    const pendingUsers = users.filter((user) => user.medStatus === "PENDING");
    pendingUsers.forEach((user) => {
      closeRequest(user._id);
    });
  };

  const addToQueue = async (userId) => {
    try {
      await axios.put(`${baseURL}/api/users/${userId}/queue`);
      showAlertMessage("Patient Added to Queue Successfully!");
      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {showAlert && <Alert message={alertMessage} />}
      <div className="bg-pale-white p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-4">All Patients</h1>
          <button
            type="button"
            onClick={closeAllRequests}
            className="bg-transparent mt-2 text-dark border hover:bg-dark hover:text-pale-white transition-all duration-300 font-bold px-4 py-2 rounded-full mb-4"
          >
            Close All Pending Requests
          </button>
        </div>
        <hr />
        <div className="container">
          <input
            type="text"
            placeholder="Search by Name, Phone, or Email"
            className="w-full px-4 py-3 mt-4 border rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="block w-full overflow-x-auto " style={{ minHeight: "27rem" }}>
        {currentItems.length === 0 ? (
          <p className="text-center">No users found.</p>
        ) : (
          <>
            <table className="items-center bg-transparent w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Name
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Phone
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Queue Number
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Action 1
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Action 2
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    Action 3
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((user, index) => (
                  <tr key={index} className="hover:font-bold">
                    <td className="border-t-0 flex px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left ">
                      <Link
                        to={`/patient/${user._id}`}
                        style={{ display: "contents" }}
                      >
                        {user.name}
                        <FaExternalLinkAlt className="ml-1 text-gray-500" />
                      </Link>
                    </td>

                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      {user.phone}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      {user.queueNumber}
                      {index === 0 && user.queueNumber !== null && (
                        <span className="px-2 py-1 bg-dark text-pale-white ml-6">
                          Ongoing
                        </span>
                      )}
                      {index === 1 &&
                        user.queueNumber !== null &&
                        user.queueNumber !== 0 && (
                          <span className="px-2 py-1 border ml-6">
                            Next in Queue
                          </span>
                        )}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      <button
                        type="button"
                        onClick={() => openDeleteConfirmation(user._id)}
                        className="text-dark border hover:bg-red transition-all duration-300 hover:text-white py-2 px-6"
                      >
                        Delete
                      </button>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-blue-800 underline">
                      {user.medStatus === "PENDING" ? (
                        <button
                          type="button"
                          onClick={() => closeRequest(user._id)}
                          className="text-dark border transition-all duration-300 hover:bg-warn hover:border-warn py-2 px-6"
                        >
                          Close Request
                        </button>
                      ) : (
                        "Request Closed"
                      )}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      {user.queueNumber !== null ? (
                        user.queueNumber === 0 ? (
                          <button
                            disabled
                            className="bg-pale-white text-dark font-bold py-2 px-4 rounded-full cursor-not-allowed"
                          >
                            Request Pending
                          </button>
                        ) : (
                          <button
                            disabled
                            className="bg-pale-white text-dark font-bold py-2 px-4 rounded-full cursor-not-allowed"
                          >
                            Already in Queue
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => addToQueue(user._id)}
                          className="bg-dark hover:scale-110 transition-all duration-300 text-pale-white py-2 px-6 rounded-full"
                        >
                          Go in line for appointment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="flex justify-center items-center mt-4">
        <div className="flex gap-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="bg-transparent hover:bg-dark text-dark hover:text-pale-white border font-bold p-2 rounded-md"
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
            className="bg-transparent hover:bg-dark text-dark hover:text-pale-white border font-bold p-2 rounded-md"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed top-0 left-0 w-full h-full bg-pale-white  bg-opacity-50 flex justify-center items-center">
          <div className="bg-pale-white p-8 rounded-md border ">
            <p className="text-lg font-semibold mb-4">Confirm Deletion</p>
            <p>Are you sure you want to delete this user permanently?</p>
            <div className="flex justify-center items-center mt-4 gap-2">
              <button
                onClick={() => deleteUser(userToDelete)}
                className="text-dark border hover:bg-red transition-all duration-300 hover:text-white py-2 px-6"
              >
                Delete
              </button>
              <button
                onClick={closeDeleteConfirmation}
                className="text-dark border hover:bg-warn transition-all duration-300 hover:text-white py-2 px-6"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
