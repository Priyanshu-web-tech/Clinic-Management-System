import { API_ROUTES } from "@/constants/constants"
import { apiSlice } from "./api-slice"
import type {
  ApiResponse,
  GetPatientsRequest,
  GetPatientsResponse,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientMutationResponse,
} from "@/types/api.types"

export const patientApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query<ApiResponse<GetPatientsResponse>, GetPatientsRequest>({
      query: (params) => ({
        url: API_ROUTES.PATIENTS,
        method: "GET",
        params,
      }),
      providesTags: ["Patients"],
    }),

    createPatient: builder.mutation<ApiResponse<PatientMutationResponse>, CreatePatientRequest>({
      query: (body) => ({
        url: API_ROUTES.PATIENTS,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Patients"],
    }),

    updatePatient: builder.mutation<
      ApiResponse<PatientMutationResponse>,
      { id: string } & UpdatePatientRequest
    >({
      query: ({ id, ...body }) => ({
        url: `${API_ROUTES.PATIENTS}/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Patients"],
    }),

    deletePatient: builder.mutation<ApiResponse<Record<string, never>>, string>({
      query: (id) => ({
        url: `${API_ROUTES.PATIENTS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Patients"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetPatientsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = patientApi
