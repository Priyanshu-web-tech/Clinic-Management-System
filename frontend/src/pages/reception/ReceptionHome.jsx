import Sidebar from "../../components/Sidebar";
import {  useState } from "react";
import { MdOutlineCreate,MdCalendarMonth } from "react-icons/md";
import CreateUser from "./CreateUser";
import Appointments from "../Appointments";

const ReceptionHome = () => {
  const [activeTab, setActiveTab] = useState("CreateUser");
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const sidebarItems = [
    { text: "CreateUser", icon: <MdOutlineCreate size={25} /> },
    { text: "Appointments", icon: <MdCalendarMonth size={25} /> },
  ];

  return (
    <>
      <div className="flex  dynamic-height-div h-[calc(100vh-5vh)]">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          sidebarItems={sidebarItems}
          category="Reception"
        />
        <div className="flex-1  ml-2 overflow-y-hidden">
          {activeTab === "CreateUser" && <CreateUser />}
          {activeTab === "Appointments" && <Appointments />}
        </div>
      </div>
    </>
  );
};

export default ReceptionHome;
