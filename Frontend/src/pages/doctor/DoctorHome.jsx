import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { TbCheckupList } from "react-icons/tb";
import Examine from "./Examine";
import Appointments from "../Appointments";
import CreateUser from "../reception/CreateUser";
import { FaChartBar } from "react-icons/fa6";
import { FaUserEdit } from "react-icons/fa";

import { CiBoxList } from "react-icons/ci";
import {
  MdCalendarMonth,
  MdOutlineAnalytics,
  MdOutlineCreate,
  MdAddchart,
} from "react-icons/md";
import Dashboard from "../inventory/Dashboard";
import ProductsTab from "../inventory/ProductsTab";
import Analytics from "../inventory/Analytics";
import DashboardDoc from "./DashboardDoc";
import Profile from "../Profile";

const DoctorHome = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Function to handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Store active tab in local storage
    localStorage.setItem("doctorActiveTab", tab);
  };

  // Define sidebar items
  const sidebarItems = [
    { text: "Dashboard", icon: <FaChartBar size={25} /> },
    { text: "Examine", icon: <TbCheckupList size={25} /> },
    { text: "Appointments", icon: <MdCalendarMonth size={25} /> },
    { text: "CreateUser", icon: <MdOutlineCreate size={25} /> },
    { text: "EditProfile", icon: <FaUserEdit size={25} /> },
    // { text: "Add-Products", icon: <MdAddchart size={25} /> },
    // { text: "Products", icon: <CiBoxList size={25} /> },
    // { text: "Analytics", icon: <MdOutlineAnalytics size={25} /> },
  ];

  // Effect to retrieve active tab from local storage on component mount
  useEffect(() => {
    const storedTab = localStorage.getItem("doctorActiveTab");
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
          category="Doctor"
        />
        <div className="flex-1 ml-2 overflow-y-scroll">
          {activeTab === "Dashboard" && (
            <DashboardDoc setActiveTab={setActiveTab} />
          )}
          {activeTab === "Examine" && <Examine />}
          {activeTab === "CreateUser" && <CreateUser />}
          {activeTab === "EditProfile" && <Profile />}

          {activeTab === "Appointments" && <Appointments />}
          {/* {activeTab === "Analytics" && <Analytics />}
          {activeTab === "Add-Products" && <Dashboard />}
          {activeTab === "Products" && <ProductsTab />} */}
        </div>
      </div>
    </>
  );
};

export default DoctorHome;
