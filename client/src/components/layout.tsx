import { useEffect, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"

import { toast } from "sonner"

import { useAppDispatch } from "@/store/hook"
import { clearUserData, setUserData } from "@/store/slices/user-data-slice"
import { useLogoutMutation, useGetMeQuery } from "@/store/api/auth-api-slice"
import { apiSlice } from "@/store/api/api-slice"
import { NAVIGATION_ROUTES } from "@/constants/constants"
import AppHeader from "@/components/app-header"
import AppSidebar from "@/components/app-sidebar"

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const [logoutApi] = useLogoutMutation()

  // Fetch fresh profile once on layout mount and sync into Redux store
  const { data: meData } = useGetMeQuery()
  useEffect(() => {
    if (meData?.result) {
      dispatch(setUserData(meData.result))
    }
  }, [meData, dispatch])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Close mobile drawer when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap()
    } catch {
      // proceed with local logout even if API call fails
    }
    dispatch(clearUserData())
    dispatch(apiSlice.util.resetApiState())
    toast.success("Logged out successfully.")
    navigate(NAVIGATION_ROUTES.LOGIN)
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <AppSidebar mobileOpen={mobileOpen} />

      {/* ── Main area ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader
          onMenuOpen={() => setMobileOpen(true)}
          onLogout={handleLogout}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
