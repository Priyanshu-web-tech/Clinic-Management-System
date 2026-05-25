import { useState, useEffect } from "react"
import type { ApiResponse, PaginatedResponse } from "@/types/api.types"

const usePaginatedQuery = <TItem, TFilters extends object>(
  queryHook: (
    params: TFilters & { page: number; pageSize: number },
    options?: object
  ) => {
    data?: ApiResponse<PaginatedResponse<TItem>>
    isLoading: boolean
    isFetching: boolean
  },
  filters: TFilters,
  pageSize = 10
) => {
  const [page, setPage] = useState(1)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setPage(1)
  }, [JSON.stringify(filters)])

  const { data, isLoading, isFetching } = queryHook(
    { ...filters, page, pageSize },
    { refetchOnMountOrArgChange: true, refetchOnFocus: true }
  )

  return {
    items: data?.result?.data ?? [],
    total: data?.result?.total ?? 0,
    totalPages: data?.result?.totalPages ?? 1,
    page,
    pageSize,
    setPage,
    isLoading,
    isFetching,
  }
}

export default usePaginatedQuery
