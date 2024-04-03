import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AccessDenied = () => (
  <div className="bg-pale-white p-8 rounded-md">
    <h2 className="text-xl font-bold mb-4">Access Denied</h2>
    <p>You do not have access to view this page.</p>
  </div>
);

export const PrivateRoute = () => {
  const { currentHospital } = useSelector((state) => state.hospital);
  const { currentUser } = useSelector((state) => state.user);

  return currentHospital && currentUser ? (
    <Outlet />
  ) : (
    <Navigate to="/clinicLogin" />
  );
};

export const DoctorRoute = () => {
  const { currentUser } = useSelector((state) => state.user);
  const isDoctor = currentUser.userRole === "Doctor";
  return (
    <div className="m-2">
      {isDoctor ? <Outlet /> : <AccessDenied />}
    </div>
  );
};

export const InventoryRoute = () => {
  const { currentUser } = useSelector((state) => state.user);
  const isInventory =
    currentUser.userRole === "Inventory" || currentUser.userRole === "Doctor";
  return (
    <div className="m-2">
      {isInventory ? <Outlet /> : <AccessDenied />}
    </div>
  );
};

export const ReceptionRoute = () => {
  const { currentUser } = useSelector((state) => state.user);
  const isReceptionist =
    currentUser.userRole === "Reception" || currentUser.userRole === "Doctor";
  return (
    <div className="m-2">
      {isReceptionist ? <Outlet /> : <AccessDenied />}
    </div>
  );
};
