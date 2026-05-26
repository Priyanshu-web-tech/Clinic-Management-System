import { LayoutDashboard, Users, UserRound } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { UserType, Designation, Gender, BloodGroup } from "@/types/api.types"
import type { IUserSessionData } from "@/store/slices/user-data-slice"

export const ALL_NAV_ITEMS: {
  label: string
  path: string
  icon: LucideIcon
  canAccess?: (user: IUserSessionData) => boolean
}[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  {
    label: "Team",
    path: "/users",
    icon: Users,
    canAccess: (user) =>
      user.userType === UserType.Admin || user.userType === UserType.Doctor,
  },
  {
    label: "Patients",
    path: "/patients",
    icon: UserRound,
    canAccess: (user) =>
      user.userType === UserType.Admin ||
      user.userType === UserType.Doctor ||
      (user.userType === UserType.Staff &&
        user.designation === Designation.Receptionist),
  },
]

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
  PATIENTS: "patients",
}

export const NAVIGATION_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_OTP: "/verify-otp",
  RESET_PASSWORD: "/reset-password",
  USERS: "/users",
  PATIENTS: "/patients",
}

export const USER_TYPE_OPTIONS = [
  { value: UserType.Admin, label: "Admin" },
  { value: UserType.Doctor, label: "Doctor" },
  { value: UserType.Staff, label: "Staff" },
] as const

export const USER_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  USER_TYPE_OPTIONS.map(({ value, label }) => [value, label])
)

export const DESIGNATION_OPTIONS = [
  { value: Designation.Receptionist, label: "Receptionist" },
  { value: Designation.Chemist, label: "Chemist" },
] as const

export const DESIGNATION_LABEL: Record<string, string> = Object.fromEntries(
  DESIGNATION_OPTIONS.map(({ value, label }) => [value, label])
)

export const USERS_TABLE_COLUMNS = [
  { name: "Name" },
  { name: "Email" },
  { name: "Phone" },
  { name: "Designation" },
  { name: "Status" },
  { name: "Actions", className: "text-right" },
]

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Team",
  "/patients": "Patients",
  "/profile": "Profile",
}

export const AUTH_FEATURES = [
  "Manage patients & staff with ease",
  "Prescriptions, labs & reports in one place",
  "Secure, role-based access control",
]

export const OTP_LENGTH = 6
export const OTP_COOLDOWN_SECS = 120

export const PAGE_SIZE = 10

export const DESIGNATION_BADGE_VARIANT: Record<
  Designation,
  "default" | "secondary" | "success" | "warning" | "outline"
> = {
  [Designation.Receptionist]: "success",
  [Designation.Chemist]: "warning",
}

// ── Patient constants ──────────────────────────────────────

export const GENDER_OPTIONS = [
  { value: Gender.Male, label: "Male" },
  { value: Gender.Female, label: "Female" },
  { value: Gender.Other, label: "Other" },
] as const

export const GENDER_LABEL: Record<string, string> = Object.fromEntries(
  GENDER_OPTIONS.map(({ value, label }) => [value, label])
)

export const BLOOD_GROUP_OPTIONS = [
  { value: BloodGroup.APos, label: "A+" },
  { value: BloodGroup.ANeg, label: "A−" },
  { value: BloodGroup.BPos, label: "B+" },
  { value: BloodGroup.BNeg, label: "B−" },
  { value: BloodGroup.ABPos, label: "AB+" },
  { value: BloodGroup.ABNeg, label: "AB−" },
  { value: BloodGroup.OPos, label: "O+" },
  { value: BloodGroup.ONeg, label: "O−" },
] as const

export const BLOOD_GROUP_LABEL: Record<string, string> = Object.fromEntries(
  BLOOD_GROUP_OPTIONS.map(({ value, label }) => [value, label])
)

export const PATIENTS_TABLE_COLUMNS = [
  { name: "Patient Code" },
  { name: "Name" },
  { name: "Phone" },
  { name: "Gender" },
  { name: "Blood Group" },
  { name: "Status" },
  { name: "Actions", className: "text-right" },
]
