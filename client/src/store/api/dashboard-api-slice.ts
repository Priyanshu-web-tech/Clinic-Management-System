import { API_ROUTES } from "@/constants/constants"
import { apiSlice } from "./api-slice"
import type { ApiResponse, DashboardStats } from "@/types/api.types"

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => ({ url: API_ROUTES.DASHBOARD_STATS, method: "GET" }),
    }),
  }),
  overrideExisting: false,
})

export const { useGetDashboardStatsQuery } = dashboardApi
