export type UserType = "admin" | "doctor" | "staff"
export type Designation = "receptionist" | "chemist"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  hospitalName: string
  address: string
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: UserType
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: AuthUser
}

export interface Hospital {
  _id: string
  name: string
  address: string
}

export interface UserProfile {
  _id: string
  email: string
  firstName: string
  lastName: string
  userType: UserType
  phone: string
  hospital: Hospital | null
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  status_code: number
  message?: string
  result: T
}

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyOtpRequest {
  otp: string
}

export interface ResetPasswordRequest {
  password: string
  confirmPassword: string
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
  phone?: string
}

export interface UpdateProfileResponse {
  user: {
    _id: string
    email: string
    firstName: string
    lastName: string
    userType: UserType
    phone: string
    createdAt: string
    updatedAt: string
  }
}

export interface UpdateHospitalRequest {
  name: string
  address?: string
}

export interface UpdateHospitalResponse {
  hospital: {
    _id: string
    name: string
    address: string
  }
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ── User Management ──────────────────────────────────────

export interface StaffUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  userType: UserType
  designation: Designation | null
  isActive: boolean
  hospital: string | null
  createdAt: string
  updatedAt: string
}

export interface GetUsersRequest {
  page?: number
  pageSize?: number
  search?: string
  designation?: Designation | ""
}

export interface GetUsersResponse {
  users: StaffUser[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  designation: Designation
}

export interface UpdateUserRequest {
  firstName: string
  lastName: string
  phone?: string
  designation: Designation
}

export interface UserMutationResponse {
  user: StaffUser
}
