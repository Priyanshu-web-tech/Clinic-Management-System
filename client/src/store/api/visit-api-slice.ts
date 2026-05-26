import { API_ROUTES } from "@/constants/constants"
import { apiSlice } from "./api-slice"
import type {
  ApiResponse,
  GetVisitsRequest,
  GetVisitsResponse,
  CreateVisitRequest,
  UpdateVisitRequest,
  VisitMutationResponse,
  VisitStatus,
} from "@/types/api.types"

export const visitApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVisits: builder.query<ApiResponse<GetVisitsResponse>, GetVisitsRequest>({
      query: (params) => ({
        url: API_ROUTES.VISITS,
        method: "GET",
        params,
      }),
      providesTags: ["Visits"],
    }),

    createVisit: builder.mutation<ApiResponse<VisitMutationResponse>, CreateVisitRequest>({
      query: (body) => ({
        url: API_ROUTES.VISITS,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Visits", "Patients"],
    }),

    updateVisitStatus: builder.mutation<
      ApiResponse<VisitMutationResponse>,
      { id: string; status: VisitStatus }
    >({
      query: ({ id, status }) => ({
        url: `${API_ROUTES.VISITS}/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Visits", "Patients"],
    }),

    getVisitById: builder.query<ApiResponse<VisitMutationResponse>, string>({
      query: (id) => ({ url: `${API_ROUTES.VISITS}/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "Visits", id }],
    }),

    updateVisit: builder.mutation<
      ApiResponse<VisitMutationResponse>,
      { id: string } & UpdateVisitRequest
    >({
      query: ({ id, ...body }) => ({
        url: `${API_ROUTES.VISITS}/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ["Visits", { type: "Visits", id }, "Patients"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetVisitsQuery,
  useCreateVisitMutation,
  useUpdateVisitStatusMutation,
  useGetVisitByIdQuery,
  useUpdateVisitMutation,
} = visitApi
