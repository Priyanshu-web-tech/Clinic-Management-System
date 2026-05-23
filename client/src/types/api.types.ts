export type UserType = "admin" | "doctor" | "staff" | "pharmacist"
export type UserStatus = "active" | "deleted" | "deactivated"

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
  first_name: string
  last_name: string
  user_type: UserType
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: AuthUser
}

export interface UserProfile {
  _id: string
  email: string
  first_name: string
  last_name: string
  user_type: UserType
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  status_code: number
  message?: string
  result: T
}
