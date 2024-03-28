import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { baseURL } from "../../utils";

const ServiceUser = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentHospital } = useSelector((state) => state.hospital);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/api/users/getUsers/${currentHospital.name}`
      );

      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentHospital]);

  const filteredUsers = users.filter((user) => {
    return (
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      user.medStatus === "PENDING" &&
      user.queueNumber === 0
    );
  });

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 bg-pale-white p-4 rounded-lg">Give Medicines</h1>
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
                  Prescription
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={index}>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                    {user.name}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                    {user.phone}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                    {user.medicalHistory.length > 0
                      ? user.medicalHistory[user.medicalHistory.length - 1]
                          .prescription
                      : "No prescription available"}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-blue-500 underline">
                    <button
                      type="button"
                      onClick={() => closeRequest(user._id)} // Pass the user ID here
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                    >
                      Close Request
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

export default ServiceUser;
