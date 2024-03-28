import Sidebar from "../../components/Sidebar";
import {  useState } from "react";
import { TbCheckupList } from "react-icons/tb";
import Examine from "./Examine";
import Appointments from "../Appointments";
import CreateUser from "../reception/CreateUser";
import { FaChartBar } from "react-icons/fa6";
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

const DoctorHome = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const sidebarItems = [
    { text: "Dashboard", icon: <FaChartBar size={25} /> },
    { text: "Examine", icon: <TbCheckupList size={25} /> },
    { text: "Appointments", icon: <MdCalendarMonth size={25} /> },
    { text: "CreateUser", icon: <MdOutlineCreate size={25} /> },
    { text: "Add-Products", icon: <MdAddchart size={25} /> },
    { text: "Products", icon: <CiBoxList size={25} /> },
    { text: "Analytics", icon: <MdOutlineAnalytics size={25} /> },
  ];




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
          {activeTab === "Dashboard" && <DashboardDoc setActiveTab={setActiveTab} />}
          {activeTab === "Examine" && <Examine />}
          {activeTab === "CreateUser" && <CreateUser />}
          {activeTab === "Appointments" && <Appointments />}
          {activeTab === "Analytics" && <Analytics />}
          {activeTab === "Add-Products" && <Dashboard />}
          {activeTab === "Products" && <ProductsTab />}
        </div>
      </div>
    </>
  );
};

export default DoctorHome;
