import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { calculateAge } from "../../utils";
import { FaUserFriends, FaHeartbeat } from "react-icons/fa";
import Notes from "../../components/Notes";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const DashboardDoc = ({ setActiveTab }) => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentHospital } = useSelector((state) => state.hospital);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/users/getUsers/${
            currentHospital.name
          }`,
          {
            withCredentials: true,
          }
        );
        const users = response.data.filter(
          (user) => user.queueNumber !== 0 && user.queueNumber !== null
        );
        const sortedUsers = users.sort((a, b) => a.queueNumber - b.queueNumber);
        setUsers(sortedUsers);

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

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

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

  // Slice the sortedUsers array based on current page and items per page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      {/* Section 1 */}
      <section className="flex flex-col md:flex-row bg-pale-white rounded-md p-2">
        {/* Left Part */}
        <div className="md:w-1/2 p-2 md:mb-0 mb-2">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
            Empowering Care One Click at a Time.
          </h1>
          <div className="flex items-center mt-3">
            <FaHeartbeat className="text-dark text-md mr-2" />
            <p className="text-sm lg:text-lg">
              Currently serving {users.length} patients.
            </p>
          </div>
        </div>
        {/* RIGHT PART */}
        <div className="md:w-1/2 md:pl-2  md:mb-0 mb-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-3xl mb-4  font-bold flex items-center ">
              <FaUserFriends className=" text-2xl mr-2" />
              Upcoming Patients
            </h2>

            <button
              className="bg-pale-white border text-xs lg:text-sm hover:bg-dark text-dark hover:text-pale-white px-3 py-2  rounded-md my-4"
              onClick={handleShowAll}
            >
              <p>Show All</p>
            </button>
          </div>

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
                      <tr
                        key={index}
                        className="transition-all duration-300 hover:font-bold hover:bg-pale-white "
                      >
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
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Section 2 */}
      <section className="flex flex-col gap-4 md:flex-row p-2 bg-white">
        {/* LEFT PART */}
        <div className="md:w-3/5 p-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-3xl mb-4  font-bold flex items-center ">
              <FaUserFriends className=" text-2xl mr-2" />
              Registered Patients
            </h2>

            <button
              className="bg-pale-white border text-xs lg:text-sm hover:bg-dark text-dark hover:text-pale-white px-3 py-2  rounded-md my-4"
              onClick={handleSetAppointment}
            >
              See All Patients
            </button>
          </div>
          <input
            type="text"
            placeholder="Search by name or phone number"
            className="w-full bg-transparent border border-gray-300 rounded-md py-2 px-4 mb-4"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="block w-full overflow-x-auto min-h-60">
            {currentItems.length === 0 ? (
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
                  {/* Table Body */}
                  <tbody>
                    {currentItems.map((user, index) => (
                      <tr
                        key={index}
                        className="transition-all duration-300 hover:font-bold hover:bg-pale-white "
                      >
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
              </div>
            )}
          </div>
          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="bg-transparent hover:bg-dark text-dark hover:text-pale-white border font-bold px-3 py-2 rounded-md"
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
                  } border font-bold px-2 py-1 rounded-md`}
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
        {/* RIGHT PART */}
        <div className="md:w-2/5 mt-4 md:mt-0 p-3">
          <Notes />
        </div>
      </section>
    </div>
  );
};

export default DashboardDoc;
