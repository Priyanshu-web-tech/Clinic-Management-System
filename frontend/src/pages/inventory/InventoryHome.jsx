import Sidebar from "../../components/Sidebar";
import Dashboard from "./Dashboard";
import ProductsTab from "./ProductsTab";
import Analytics from "./Analytics";
import ServiceUser from "./ServiceUser";
import { CiBoxList } from "react-icons/ci";
import { useState } from "react";
import { MdAddchart, MdMedicalServices,MdOutlineAnalytics } from "react-icons/md";

const InventoryHome = () => {
  const [activeTab, setActiveTab] = useState("ServiceUser");
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const sidebarItems = [
    { text: "ServiceUser", icon: <MdMedicalServices size={25} /> },
    { text: "Add-Products", icon: <MdAddchart size={25} /> },
    { text: "Products", icon: <CiBoxList size={25} /> },
    { text: "Analytics", icon: <MdOutlineAnalytics size={25} /> },

  ];

 

  return (
    <>
      <div className="flex  dynamic-height-div h-[calc(100vh-5vh)]">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          sidebarItems={sidebarItems}
          category="Inventory"
        />
        <div className="flex-1  ml-2  overflow-y-hidden">
          {activeTab === "ServiceUser" && <ServiceUser />}
          {activeTab === "Analytics" && <Analytics />}

          {activeTab === "Add-Products" && <Dashboard />}
          {activeTab === "Products" && <ProductsTab />}
        </div>
      </div>
    </>
  );
};

export default InventoryHome;
