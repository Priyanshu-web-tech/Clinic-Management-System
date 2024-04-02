import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Alert, calculateAge } from "../../utils";

const Examine = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentHospital } = useSelector((state) => state.hospital);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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
        `${import.meta.env.VITE_BASE_URL}/api/users/getUsers/${currentHospital.name}`, {
          withCredentials: true, // This ensures cookies are sent
        }
      );
      const sortedUsers = response.data.sort(
        (a, b) => a.queueNumber - b.queueNumber
      );
      setUsers(sortedUsers);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    return (
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      user.queueNumber !== null &&
      user.queueNumber !== 0
    );
  });

  const resetQueue = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/users/reset-queue/${currentHospital.name}`, {
          withCredentials: true, // This ensures cookies are sent
        }
      );
      showAlertMessage("Queue numbers reset Successfully!");
      fetchUsers();
    } catch (error) {
      showAlertMessage("Error resetting queue numbers: " + error.message);
    }
  };

  const removeFromQueue = (userId) => {
    axios
      .patch(
        `${import.meta.env.VITE_BASE_URL}/api/users/updateUser/${userId}`,
        { queueNumber: null },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true 

        }
      )
      .then((response) => {
        if (response.data.acknowledged === true) {
          console.log("Status Updated Successfully");
          fetchUsers();
        }
      })
      .catch((error) => {
        console.error("Error updating STATUS:", error);
      });
  };
  return (
    <div className="flex flex-col gap-4">
      {showAlert && <Alert message={alertMessage} />}
      <div className="p-4 bg-pale-white rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-4">Examine Patients</h1>
          <button
            type="button"
            className="bg-transparent mt-2 text-dark border hover:bg-dark hover:text-pale-white transition-all duration-300 font-bold px-4 py-2 rounded-full mb-4"
            onClick={resetQueue}
          >
            Reset Queue
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
      <div className="block w-full overflow-x-auto">
        {filteredUsers.length === 0 ? (
          <p className="text-center">No users found.</p>
        ) : (
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
                  Age
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Gender
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Queue Number
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Action 1
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Remove from Queue
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                  <tr key={index} className="transition-all duration-300 hover:font-bold hover:bg-pale-white ">
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                    {user.name}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                    {user.phone}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                    {calculateAge(user.dob)}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                    {user.gender}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                    {user.queueNumber}
                    {index === 0 && (
                      <span className="px-2 py-1 bg-dark text-pale-white ml-6">
                        Ongoing
                      </span>
                    )}
                    {index === 1 && (
                      <span className="px-2 py-1 border ml-6">
                        Next in Queue
                      </span>
                    )}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-blue-500 underline">
                    {index === 0 ? (
                      <Link to={`/patient/${user._id}`}>
                        <button className="bg-dark hover:scale-110 transition-all duration-300 text-pale-white py-2 px-6 rounded-full">
                          Prescribe
                        </button>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="bg-gray hover:scale-110 transition-all duration-300 text-pale-white py-2 px-6 rounded-full cursor-not-allowed"
                      >
                        Prescribe
                      </button>
                    )}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-blue-500 underline">
                    <button className="bg-dark hover:scale-110 transition-all duration-300 text-pale-white py-2 px-6 rounded-full"
                      onClick={() => removeFromQueue(user._id)} 
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Examine;
