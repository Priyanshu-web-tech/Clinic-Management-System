import { API_ROUTES } from "@/constants/constants"
import { apiSlice } from "./apiSlice"
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserProfile,
  ApiResponse,
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
  }),
  overrideExisting: false,
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi
