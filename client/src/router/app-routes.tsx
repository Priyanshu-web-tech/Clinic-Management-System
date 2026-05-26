import { lazy } from "react"
import { Navigate, Route, Routes, Outlet } from "react-router-dom"

import { useAppSelector } from "@/store/hook"

const Layout = lazy(() => import("@/components/layout"))
const AuthLayout = lazy(() => import("@/components/auth-layout"))
const Login = lazy(() => import("@/pages/login/login"))
const Register = lazy(() => import("@/pages/register/register"))
const Dashboard = lazy(() => import("@/pages/dashboard/dashboard"))
const Profile = lazy(() => import("@/pages/profile/profile"))
const Users = lazy(() => import("@/pages/users/users"))
const Patients = lazy(() => import("@/pages/patients/patients"))
const PatientDetail = lazy(() => import("@/pages/patients/patient-detail"))
const Visits = lazy(() => import("@/pages/visits/visits"))
const VisitDetail = lazy(() => import("@/pages/visits/visit-detail"))
const ForgotPassword = lazy(
  () => import("@/pages/forgot-password/forgot-password")
)
const VerifyOtp = lazy(() => import("@/pages/verify-otp/verify-otp"))
const ResetPassword = lazy(
  () => import("@/pages/reset-password/reset-password")
)

const PrivateRoute = () => {
  const isSignedIn = useAppSelector((state) => state.userData.isSignedIn)
  return isSignedIn ? <Outlet /> : <Navigate to="/login" replace />
}

const PublicRoute = () => {
  const isSignedIn = useAppSelector((state) => state.userData.isSignedIn)
  return !isSignedIn ? <Outlet /> : <Navigate to="/" replace />
}

const AppRoutes = () => {
  const isSignedIn = useAppSelector((state) => state.userData.isSignedIn)

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="verify-otp" element={<VerifyOtp />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="visits" element={<Visits />} />
          <Route path="visits/:id" element={<VisitDetail />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to={isSignedIn ? "/" : "/login"} replace />}
      />
    </Routes>
  )
}

export default AppRoutes
