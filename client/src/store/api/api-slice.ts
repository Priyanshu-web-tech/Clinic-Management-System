import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { toast } from "sonner"

import type { RootState } from "../store"
import { clearUserData } from "../slices/user-data-slice"
import { BASE_URL, API_ROUTES, NAVIGATION_ROUTES } from "@/constants/constants"
import { navigate } from "@/utils/navigation"

let isLoggingOut = false
let isRefreshing = false

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  timeout: 60000,
  credentials: "include",
})

const handleLogout = (api: BaseQueryApi) => {
  if (isLoggingOut) return

  isLoggingOut = true
  api.dispatch(clearUserData())
  api.dispatch(apiSlice.util.resetApiState())

  toast.error("Session expired. Please login again.")
  navigate(NAVIGATION_ROUTES.LOGIN)

  setTimeout(() => {
    isLoggingOut = false
  }, 1000)
}

const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  const state = api.getState() as RootState
  const isSignedIn = state?.userData?.isSignedIn
  const status = result?.error?.status
  if (status && isSignedIn && [401].includes(status as number)) {
    if (!isRefreshing) {
      isRefreshing = true

      const refreshResult = await rawBaseQuery(
        { url: API_ROUTES.REFRESH, method: "POST" },
        api,
        extraOptions
      )

      if (refreshResult.data) {
        result = await rawBaseQuery(args, api, extraOptions)
      } else {
        handleLogout(api)
      }

      isRefreshing = false
    }
  }
  return result
}

export const apiSlice = createApi({
  baseQuery: dynamicBaseQuery,
  tagTypes: ["Users"],
  endpoints: () => ({}),
})
