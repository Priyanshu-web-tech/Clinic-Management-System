import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";
import { MdOutlineCreate, MdCalendarMonth } from "react-icons/md";
import CreateUser from "./CreateUser";
import Appointments from "../Appointments";
import Profile from "../Profile";
import { FaUserEdit } from 'react-icons/fa';

const ReceptionHome = () => {
  const [activeTab, setActiveTab] = useState("CreateUser");

  // Function to handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Store active tab in local storage
    localStorage.setItem('receptionActiveTab', tab);
  };

  // Define sidebar items
  const sidebarItems = [
    { text: "CreateUser", icon: <MdOutlineCreate size={25} /> },
    { text: "Appointments", icon: <MdCalendarMonth size={25} /> },
    { text: "EditProfile", icon: <FaUserEdit size={25} /> },

  ];

  // Effect to retrieve active tab from local storage on component mount
  useEffect(() => {
    const storedTab = localStorage.getItem('receptionActiveTab');
    if (storedTab) {
      setActiveTab(storedTab);
    }
  }, []);

  return (
    <>
      <div className="flex dynamic-height-div h-[calc(100vh-5vh)]">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          sidebarItems={sidebarItems}
          category="Reception"
        />
        <div className="flex-1 ml-2 overflow-y-hidden">
          {activeTab === "CreateUser" && <CreateUser />}
          {activeTab === "EditProfile" && <Profile />}
          {activeTab === "Appointments" && <Appointments />}
        </div>
      </div>
    </>
  );
};

export default ReceptionHome;
