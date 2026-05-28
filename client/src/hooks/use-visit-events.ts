import { useEffect } from "react"
import { useAppDispatch } from "@/store/hook"
import { BASE_URL } from "@/constants/constants"
import { apiSlice } from "@/store/api/api-slice"

export function useVisitEvents() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const es = new EventSource(`${BASE_URL}events`, { withCredentials: true })

    es.onmessage = (e: MessageEvent) => {
      try {
        const { type } = JSON.parse(e.data as string)
        if (type === "visits_updated") {
          dispatch(apiSlice.util.invalidateTags(["Visits", "Patients", "Prescriptions"]))
        }
      } catch (_) {
        // ignore malformed events
      }
    }

    return () => es.close()
  }, [dispatch])
}
