import { API_ROUTES } from "@/constants/constants"
import { apiSlice } from "./apiSlice"
import type {
  ApiResponse,
  GetUsersRequest,
  GetUsersResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserMutationResponse,
} from "@/types/api.types"

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ApiResponse<GetUsersResponse>, GetUsersRequest>({
      query: (params) => ({
        url: API_ROUTES.USERS,
        method: "GET",
        params,
      }),
      providesTags: ["Users"],
    }),

    createUser: builder.mutation<ApiResponse<UserMutationResponse>, CreateUserRequest>({
      query: (body) => ({
        url: API_ROUTES.USERS,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    updateUser: builder.mutation<
      ApiResponse<UserMutationResponse>,
      { id: string } & UpdateUserRequest
    >({
      query: ({ id, ...body }) => ({
        url: `${API_ROUTES.USERS}/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    deleteUser: builder.mutation<ApiResponse<Record<string, never>>, string>({
      query: (id) => ({
        url: `${API_ROUTES.USERS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi
