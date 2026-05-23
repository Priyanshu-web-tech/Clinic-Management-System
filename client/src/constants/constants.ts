export const BASE_URL = import.meta.env.VITE_BASE_URL

export const API_ROUTES = {
  LOGIN: "v1/auth/login",
  REGISTER: "v1/auth/register",
  ME: "v1/auth/me",
  REFRESH: "v1/auth/refresh",
}

export const NAVIGATION_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
}
