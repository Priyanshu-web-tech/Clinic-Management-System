import { useNavigate } from "react-router-dom"
import AppRoutes from "./router/appRoutes"
import { useEffect } from "react"
import { setNavigator } from "./utils/navigation"
import { Toaster } from "./components/ui/sonner"

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    setNavigator(navigate)
  }, [navigate])

  return (
    <>
      <AppRoutes />
      <Toaster position="top-center" />
    </>
  )
}

export default App
