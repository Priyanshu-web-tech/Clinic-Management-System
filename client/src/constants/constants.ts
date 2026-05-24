export const BASE_URL = import.meta.env.VITE_BASE_URL

export const API_ROUTES = {
  LOGIN: "auth/login",
  REGISTER: "auth/register",
  ME: "auth/me",
  REFRESH: "auth/refresh",
  FORGOT_PASSWORD: "auth/forgot-password",
  VERIFY_OTP: "auth/verify-otp",
  RESET_PASSWORD: "auth/reset-password",
  UPDATE_PROFILE: "auth/update-profile",
  CHANGE_PASSWORD: "auth/change-password",
  LOGOUT: "auth/logout",
  UPDATE_HOSPITAL: "hospital",
  USERS: "users",
}

export const USER_TYPE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "doctor", label: "Doctor" },
  { value: "staff", label: "Staff" },
  { value: "chemist", label: "Chemist" },
] as const

export const USER_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  USER_TYPE_OPTIONS.map(({ value, label }) => [value, label])
)

export const NAVIGATION_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_OTP: "/verify-otp",
  RESET_PASSWORD: "/reset-password",
  USERS: "/users",
}
