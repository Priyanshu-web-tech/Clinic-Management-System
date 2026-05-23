import { useAppSelector } from "@/store/hook"

const ProgressLoader = () => {
  const isLoading = useAppSelector((state) => state.loading.isLoading)

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="h-16 w-16 animate-spin rounded-full border-8 border-gray-200 border-t-blue-500" />
    </div>
  )
}

export default ProgressLoader
