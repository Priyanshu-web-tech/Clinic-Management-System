import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Signup from "../pages/auth/Signup";
import ReceptionHome from "../pages/reception/ReceptionHome";
import Front from "../pages/Front";
import ClinicLogin from "../pages/auth/ClinicLogin";
import DoctorHome from "../pages/doctor/DoctorHome";
import Patient from "../pages/doctor/Patient";
import InventoryHome from "../pages/inventory/InventoryHome";
import {
  PrivateRoute,
  DoctorRoute,
  InventoryRoute,
  ReceptionRoute,
} from "./RouteGuards";
import PageNotFound from "../pages/PageNotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Front />,
      },
      {
        path: "/clinicLogin",
        element: <ClinicLogin />,
      },
      {
        path: "/register",
        element: <Signup />,
      },
      {
        path: "/*",
        element: <PageNotFound />,
      },
      {
        path: "/patient/:id",
        element: <Patient />,
        loader: ({ params }) =>
          fetch(
            `${import.meta.env.VITE_BASE_URL}/api/users/getUser/${params.id}`,
            {
              withCredentials: true, // This ensures cookies are sent
            }
          ),
      },
      {
        path: "/",
        element: <PrivateRoute />,
        children: [
          // Reception Paths
          {
            path: "/",
            element: <ReceptionRoute />,
            children: [
              {
                path: "/receptionHome",
                element: <ReceptionHome />,
              },
            ],
          },
          // Inventory Paths
          {
            path: "/",
            element: <InventoryRoute />,
            children: [
              {
                path: "/inventoryHome",
                element: <InventoryHome />,
              },
            ],
          },
          // Doctor Paths
          {
            path: "/",
            element: <DoctorRoute />,
            children: [
              {
                path: "/DoctorHome",
                element: <DoctorHome />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
