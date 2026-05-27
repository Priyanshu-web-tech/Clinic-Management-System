import { API_ROUTES } from "@/constants/constants"
import { apiSlice } from "./api-slice"
import type {
  ApiResponse,
  GetPrescriptionsRequest,
  GetPrescriptionsResponse,
} from "@/types/api.types"

export const prescriptionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPrescriptions: builder.query<ApiResponse<GetPrescriptionsResponse>, GetPrescriptionsRequest>({
      query: (params) => ({
        url: API_ROUTES.PRESCRIPTIONS,
        method: "GET",
        params,
      }),
      providesTags: ["Prescriptions"],
    }),
  }),
  overrideExisting: false,
})

export const { useGetPrescriptionsQuery } = prescriptionApi
