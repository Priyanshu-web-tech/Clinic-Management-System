import { useNavigate } from "react-router-dom"
import AppRoutes from "./router/appRoutes"
import { Suspense, useEffect } from "react"
import { setNavigator } from "./utils/navigation"
import { Toaster } from "./components/ui/sonner"
import Loader from "./components/loader/loader"

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    setNavigator(navigate)
  }, [navigate])

  return (
    <Suspense fallback={<Loader />}>
      <AppRoutes />
      <Toaster position="top-center" />
    </Suspense>
  )
}

export default App
