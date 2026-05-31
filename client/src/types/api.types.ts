export const UserType = {
  Admin: "admin",
  Doctor: "doctor",
  Staff: "staff",
} as const
export type UserType = (typeof UserType)[keyof typeof UserType]

export const Designation = {
  Receptionist: "receptionist",
  Chemist: "chemist",
} as const
export type Designation = (typeof Designation)[keyof typeof Designation]

export const Gender = {
  Male: "male",
  Female: "female",
  Other: "other",
} as const
export type Gender = (typeof Gender)[keyof typeof Gender]

export const BloodGroup = {
  APos: "A+",
  ANeg: "A-",
  BPos: "B+",
  BNeg: "B-",
  ABPos: "AB+",
  ABNeg: "AB-",
  OPos: "O+",
  ONeg: "O-",
} as const
export type BloodGroup = (typeof BloodGroup)[keyof typeof BloodGroup]

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
  designation?: Designation | null
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
  designation?: Designation | null
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

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
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
    designation?: Designation | null
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

export type GetUsersResponse = PaginatedResponse<StaffUser>

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

// ── Patient Management ──────────────────────────────────────

export interface Patient {
  _id: string
  hospital: string
  patientCode: string
  firstName: string
  lastName: string
  gender: Gender
  dateOfBirth: string | null
  phone: string
  email?: string | null
  bloodGroup: BloodGroup | null
  allergies: string[]
  chronicDiseases: string[]
  isActive: boolean
  activeVisitStatus: VisitStatus | null
  createdAt: string
  updatedAt: string
}

export interface GetPatientsRequest {
  page?: number
  pageSize?: number
  search?: string
  gender?: Gender | ""
  bloodGroup?: BloodGroup | ""
}

export type GetPatientsResponse = PaginatedResponse<Patient>

export interface CreatePatientRequest {
  firstName: string
  lastName?: string
  phone: string
  email?: string | null
  gender: Gender
  dateOfBirth?: string | null
  bloodGroup?: BloodGroup | null | ""
  allergies?: string[]
  chronicDiseases?: string[]
}

export interface UpdatePatientRequest {
  firstName: string
  lastName?: string
  phone: string
  email?: string | null
  gender: Gender
  dateOfBirth?: string | null
  bloodGroup?: BloodGroup | null | ""
  allergies?: string[]
  chronicDiseases?: string[]
}

export interface PatientMutationResponse {
  patient: Patient
}

// ── Visit Management ──────────────────────────────────────

export const VisitStatus = {
  Waiting: "waiting",
  InConsultation: "in_consultation",
  Completed: "completed",
  Cancelled: "cancelled",
} as const
export type VisitStatus = (typeof VisitStatus)[keyof typeof VisitStatus]

export interface Visit {
  _id: string
  hospital: string
  patient: {
    _id: string
    firstName: string
    lastName: string
    patientCode: string
    phone?: string
    gender?: Gender
    dateOfBirth?: string | null
    bloodGroup?: BloodGroup | null
    allergies?: string[]
    chronicDiseases?: string[]
  }
  doctor: {
    _id: string
    firstName: string
    lastName: string
  }
  visitNumber: string
  status: VisitStatus
  tokenNumber: number
  symptoms: string
  diagnosis: string
  followUpDate: string | null
  closedAt: string | null
  prescription: { _id: string; medicines: PrescriptionMedicine[] } | null
  createdBy: {
    _id: string
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt: string
}

export interface GetVisitsRequest {
  page?: number
  pageSize?: number
  search?: string
  status?: VisitStatus | "active" | ""
  date?: string
  doctorId?: string
  patientId?: string
  excludeVisitId?: string
}

export type GetVisitsResponse = PaginatedResponse<Visit>

export interface CreateVisitRequest {
  patientId: string
  symptoms?: string
}

export interface UpdateVisitStatusRequest {
  status: VisitStatus
}

export interface UpdateVisitRequest {
  symptoms?: string
  diagnosis?: string
  followUpDate?: string | null
  status?: VisitStatus
  medicines?: PrescriptionMedicineInput[]
}

export interface VisitMutationResponse {
  visit: Visit
}

// ── Prescription Management ──────────────────────────────────────

export const DurationUnit = {
  Days: "days",
  Weeks: "weeks",
  Months: "months",
} as const
export type DurationUnit = (typeof DurationUnit)[keyof typeof DurationUnit]

export const MedicineTiming = {
  BeforeFood: "before_food",
  AfterFood: "after_food",
  WithFood: "with_food",
  Anytime: "anytime",
} as const
export type MedicineTiming = (typeof MedicineTiming)[keyof typeof MedicineTiming]

export interface PrescriptionMedicineInput {
  medicineName: string
  durationValue: number
  durationUnit: DurationUnit
  frequency: { morning: number; afternoon: number; night: number }
  timing: MedicineTiming
}

export interface PrescriptionMedicine extends PrescriptionMedicineInput {
  _id: string
  prescription: string
  createdAt: string
  updatedAt: string
}

export interface Prescription {
  _id: string
  hospital: string
  visit: string | { _id: string; visitNumber: string; tokenNumber: number; status: VisitStatus; createdAt: string }
  patient: { _id: string; firstName: string; lastName: string; patientCode: string }
  doctor: { _id: string; firstName: string; lastName: string }
  medicines: PrescriptionMedicine[]
  createdAt: string
  updatedAt: string
}

export interface GetPrescriptionsRequest {
  page?: number
  pageSize?: number
  date?: string
  search?: string
  patientId?: string
}

export type GetPrescriptionsResponse = PaginatedResponse<Prescription>

// ── Dashboard ──────────────────────────────────────

export interface VisitTrendDay {
  date: string
  completed: number
  cancelled: number
}

export interface DashboardStats {
  todayVisits: number
  waitingVisits: number
  inConsultationVisits: number
  completedVisits: number
  cancelledVisits: number
  totalPatients: number
  todayPrescriptions: number
  totalPrescriptions: number
  totalStaff: number
  visitTrend: VisitTrendDay[]
}

