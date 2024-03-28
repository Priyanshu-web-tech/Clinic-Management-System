import { LuChevronFirst, LuChevronLast } from "react-icons/lu";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { IoLogOutOutline } from "react-icons/io5";
import {baseURL} from "../utils";

import {
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";

import {
  signOutHospitalStart,
  signOutHospitalSuccess,
  signOutHospitalFailure,
} from "../redux/user/hospitalSlice";

export default function Sidebar({
  activeTab,
  onTabChange,
  sidebarItems,
  category,
}) {
  const [expanded, setExpanded] = useState(true);
  const dispatch = useDispatch();
   

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch(`${baseURL}/api/auth/signout`);
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(data.message));
    }
  };

  const handleClinicSignOut = async () => {
    try {
      dispatch(signOutHospitalStart());
      const res = await fetch(`${baseURL}/api/auth/signoutHospital`);
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutHospitalFailure(data.message));
        return;
      }
      dispatch(signOutHospitalSuccess(data));
      handleSignOut();
    } catch (error) {
      dispatch(signOutHospitalFailure(data.message));
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setExpanded(window.innerWidth > 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <aside className="">
        <nav className="h-full p-2 flex flex-col justify-between bg-pale-white rounded-lg shadow-sm">
          <div>
          <div className="pb-2 flex justify-center items-center">
            <h1
              className={`overflow-hidden text-2xl font-bold transition-all ${
                expanded ? "w-32" : "hidden"
              }`}
            >
              {category}
            </h1>
            <button
              onClick={() => setExpanded((curr) => !curr)}
              className="rounded-md py-2 px-3 my-1  bg-dark text-white border"
            >
              {expanded ? (
                <LuChevronFirst size={25} />
              ) : (
                <LuChevronLast size={25} />
              )}
            </button>
          </div>

          <ul className="border-t">
            {sidebarItems.map((item, index) => (
              <SidebarItem
                key={index}
                text={item.text}
                icon={item.icon}
                active={activeTab === item.text}
                expanded={expanded}
                onClick={() => onTabChange(item.text)}
              />
            ))}
          </ul>
          </div>
          <div className="flex-col">
            <div
              className={`overflow-hidden transition-all ${
                expanded ? "w-full" : "hidden"
              } `}
            >
              <button
                onClick={handleClinicSignOut}
                className="bg-dark text-white border hover:scale-105 transition-all duration-300 w-full p-2 my-1 font-medium rounded-md cursor-pointer hover:bg-dark"
              >
                Sign Out
              </button>
            </div>
            <div
              className={`overflow-hidden transition-all ${
                expanded ? "hidden" : "w-full"
              } `}
            >
              <button
                onClick={handleClinicSignOut}
                className="bg-dark text-white border w-full p-2 my-1 font-medium rounded-md cursor-pointer hover:bg-dark flex justify-center items-center"
              >
                <IoLogOutOutline size={25} />
              </button>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}

function SidebarItem({ text, active, onClick, icon, expanded }) {
  return (
    <li
      className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md gap-2 cursor-pointer transition-colors group ${
        active
          ? "bg-dark text-pale-white"
          : "hover:bg-dark hover:text-pale-white"
      }`}
      onClick={onClick}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all ${
          expanded ? "w-full" : "hidden"
        }`}
      >
        {text}
      </span>
      {!expanded && (
        <div
          className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-slate-100 text-slate-800 text-sm invisible opacity-20 -translate-x-3 transition-all duration-75 bg-dark group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
        >
          {text}
        </div>
      )}
    </li>
  );
}
