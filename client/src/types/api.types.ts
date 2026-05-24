export type UserType = "admin" | "doctor" | "staff" | "chemist"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  userType: UserType
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

export interface UserProfile {
  _id: string
  email: string
  firstName: string
  lastName: string
  userType: UserType
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
}

export interface UpdateProfileResponse {
  user: {
    _id: string
    email: string
    firstName: string
    lastName: string
    userType: UserType
    createdAt: string
    updatedAt: string
  }
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
