import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { baseURL, calculateAge } from "../../utils";
import { FaUserFriends, FaHeartbeat } from "react-icons/fa";
import { Link } from "react-router-dom";
import Notes from "../Notes";

const DashboardDoc = ({ setActiveTab }) => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentHospital } = useSelector((state) => state.hospital);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/api/users/getUsers/${currentHospital.name}`
        );
        const users = response.data.filter(
          (user) => user.queueNumber !== 0 && user.queueNumber !== null
        );
        const sortedUsers = users.sort((a, b) => a.queueNumber - b.queueNumber);
        setUsers(sortedUsers); // Limiting to first 5 users

        const allUsers = response.data;
        setAllUsers(allUsers);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, []);

  const handleShowAll = () => {
    setActiveTab("Examine");
  };

  const handleSetAppointment = () => {
    setActiveTab("Appointments");
  };

  // Filter users based on search term
  const filteredUsers = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm))
  );

  // Sort filtered users by name
  const sortedUsers = filteredUsers.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="mx-auto rounded-md bg-pale-white ">
      <div className="flex flex-col md:flex-row bg-pale-white rounded-md p-3">
        <div className="md:w-1/2 p-2 md:mr-4 md:mb-0 mb-4">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
            Empowering Care One Click at a Time.
          </h1>
          <div className="flex items-center mt-4">
            <FaHeartbeat className="text-dark text-sm mr-2" />
            <p className="text-sm lg:text-lg">
              Currently serving {users.length} patients.
            </p>
          </div>
        </div>

        <div className="md:w-1/2 md:pl-4 md:mb-0 mb-4">
          <h2 className="text-2xl md:text-3xl mb-4 ml-2 font-bold flex items-center">
            <FaUserFriends className="text-gray-500 text-xl mr-2" />
            Upcoming Patients
          </h2>

          <div className="block w-full overflow-x-auto">
            {users.length === 0 ? (
              <p className="text-center text-gray-500">
                No patients are currently waiting.
              </p>
            ) : (
              <div>
                <table className="items-center bg-transparent w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Name
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
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 2).map((user, index) => (
                      <tr key={index}>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          {user.name}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  className="bg-pale-white border text-xs lg:text-sm hover:bg-dark text-dark hover:text-pale-white px-6 py-2 ml-2 rounded-md my-4"
                  onClick={handleShowAll}
                >
                  <p>Show All</p>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row p-4 bg-white">
        <div className="md:w-3/5">
        <h2 className="text-3xl mb-4 ml-2 font-bold flex items-center">
              <FaUserFriends className="text-gray-500 text-xl mr-2" />
              All Patients
            </h2>

            <input
              type="text"
              placeholder="Search by name or phone number"
              className="w-full bg-transparent border border-gray-300 rounded-md py-2 px-4 mb-4"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          <div className="block w-full overflow-x-auto">
            
            {allUsers.length === 0 ? (
              <p className="text-center text-gray-500">
                No patients are currently waiting.
              </p>
            ) : (
              <div>
                <table className="items-center bg-transparent w-full border-collapse">
                  {/* Table Header */}
                  <thead>
                    <tr>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Name
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Age
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Gender
                      </th>

                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Phone
                      </th>
                    </tr>
                  </thead>
                  {/* Table Two */}
                  <tbody>
                    {sortedUsers.map((user, index) => (
                      <tr key={index}>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          {user.name}
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          {calculateAge(user.dob)}
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          {user.gender}
                        </td>
                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                          {user.phone}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button
                  className="bg-transparent hover:bg-dark text-dark hover:text-pale-white border font-bold  px-6 py-2 ml-2 rounded-md my-4"
                  onClick={handleSetAppointment}
                >
                  Set Appointments
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="w-full  md:w-2/5 mt-4 md:mt-0">
          <div className="rounded-lg ">
            <h1 className="text-3xl font-bold mb-4">Navigating Made Easy!</h1>
            <p className="text-gray-700 mb-4">
              Visit to each section separately:
            </p>

            <div className="space-x-2">
              <Link to="/receptionHome">
                <button className="w-full flex items-center justify-center font-bold py-2 px-6 bg-transparent hover:bg-dark transition-all duration-300 text-dark border hover:text-pale-white rounded-md">
                  <span>Reception</span>
                </button>
              </Link>

              <Link to="/inventoryHome">
              <button className="w-full flex transition-all duration-300 items-center justify-center font-bold py-2 px-6 bg-transparent hover:bg-dark text-dark border hover:text-pale-white rounded-md">
                  <span>Inventory</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
        <Notes />
      </div>
    </div>
  );
};

export default DashboardDoc;
