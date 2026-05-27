import { API_ROUTES } from "@/constants/constants"
import { apiSlice } from "./api-slice"
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserProfile,
  ApiResponse,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UpdateHospitalRequest,
  UpdateHospitalResponse,
  ChangePasswordRequest,
} from "@/types/api.types"

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // LOGIN
    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (body) => ({
        url: API_ROUTES.LOGIN,
        method: "POST",
        body,
      }),
    }),

    // REGISTER
    register: builder.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
      query: (body) => ({
        url: API_ROUTES.REGISTER,
        method: "POST",
        body,
      }),
    }),

    // GET USER PROFILE
    getMe: builder.query<ApiResponse<UserProfile>, void>({
      query: () => ({
        url: API_ROUTES.ME,
        method: "GET",
      }),
    }),

    // REFRESH
    refreshToken: builder.mutation<
      ApiResponse<{ token: string; refreshToken: string }>,
      void
    >({
      query: () => ({
        url: API_ROUTES.REFRESH,
        method: "POST",
      }),
    }),

    // FORGOT PASSWORD
    forgotPassword: builder.mutation<ApiResponse<Record<string, never>>, ForgotPasswordRequest>({
      query: (body) => ({
        url: API_ROUTES.FORGOT_PASSWORD,
        method: "POST",
        body,
      }),
    }),

    // VERIFY OTP
    verifyOtp: builder.mutation<ApiResponse<Record<string, never>>, VerifyOtpRequest>({
      query: (body) => ({
        url: API_ROUTES.VERIFY_OTP,
        method: "POST",
        body,
      }),
    }),

    // RESET PASSWORD
    resetPassword: builder.mutation<ApiResponse<Record<string, never>>, ResetPasswordRequest>({
      query: (body) => ({
        url: API_ROUTES.RESET_PASSWORD,
        method: "POST",
        body,
      }),
    }),

    // UPDATE PROFILE
    updateProfile: builder.mutation<ApiResponse<UpdateProfileResponse>, UpdateProfileRequest>({
      query: (body) => ({
        url: API_ROUTES.UPDATE_PROFILE,
        method: "PUT",
        body,
      }),
    }),

    // CHANGE PASSWORD
    changePassword: builder.mutation<ApiResponse<Record<string, never>>, ChangePasswordRequest>({
      query: (body) => ({
        url: API_ROUTES.CHANGE_PASSWORD,
        method: "POST",
        body,
      }),
    }),

    // UPDATE HOSPITAL
    updateHospital: builder.mutation<ApiResponse<UpdateHospitalResponse>, UpdateHospitalRequest>({
      query: (body) => ({
        url: API_ROUTES.UPDATE_HOSPITAL,
        method: "PUT",
        body,
      }),
    }),

    // LOGOUT
    logout: builder.mutation<ApiResponse<Record<string, never>>, void>({
      query: () => ({
        url: API_ROUTES.LOGOUT,
        method: "POST",
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useUpdateHospitalMutation,
  useChangePasswordMutation,
  useLogoutMutation,
} = authApi
