import { useEffect, useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Stethoscope,
  UserRound,
  Menu,
} from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { toast } from "sonner"

import { useAppDispatch, useAppSelector } from "@/store/hook"
import { clearUserData } from "@/store/slices/userDataSlice"
import { NAVIGATION_ROUTES } from "@/constants/constants"
import type { NavItem } from "./layout.types"

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
]

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/profile": "Profile",
}

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector((state) => state.userData)

  const pageTitle = PAGE_TITLES[location.pathname] ?? "DocMate"
  const initials =
    user.first_name && user.last_name
      ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
      : "?"

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

  const handleLogout = () => {
    dispatch(clearUserData())
    toast.success("Logged out successfully.")
    navigate(NAVIGATION_ROUTES.LOGIN)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-sidebar-border bg-sidebar
          transition-transform duration-300 ease-in-out
          md:relative md:z-auto md:translate-x-0 md:transition-[width,transform]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "md:w-14" : "md:w-56"}
        `}
      >
        {/* Brand */}
        <div
          className={`flex h-14 shrink-0 items-center border-b border-sidebar-border px-3 ${
            collapsed ? "md:justify-center" : "gap-2.5"
          }`}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Stethoscope className="size-4" />
          </div>
          <span
            className={`text-sm font-semibold tracking-tight text-sidebar-foreground ${
              collapsed ? "md:hidden" : ""
            }`}
          >
            Doc Mate
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-md px-2 py-2 text-sm transition-colors ${
                  collapsed ? "md:justify-center" : "gap-3"
                } ${
                  isActive
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <item.icon className="size-4 shrink-0" />
              <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle — desktop only */}
        <div className="hidden border-t border-sidebar-border p-2 md:block">
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex w-full items-center justify-center rounded-md px-2 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
            </button>
            <h1 className="text-sm font-semibold text-foreground">{pageTitle}</h1>
          </div>

          {/* Avatar dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 focus:outline-none">
                {initials}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-40 overflow-hidden rounded-lg border border-border bg-card p-1 shadow-md animate-in fade-in-0 zoom-in-95"
              >
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-foreground">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {user.email}
                  </p>
                </div>

                <DropdownMenu.Separator className="my-1 h-px bg-border" />

                <DropdownMenu.Item
                  onSelect={() => navigate(NAVIGATION_ROUTES.PROFILE)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <UserRound className="size-3.5" />
                  Profile
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-border" />

                <DropdownMenu.Item
                  onSelect={handleLogout}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-destructive outline-none transition-colors hover:bg-destructive/10 data-highlighted:bg-destructive/10"
                >
                  <LogOut className="size-3.5" />
                  Logout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
