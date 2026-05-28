import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { ChevronLeft, ChevronRight, Stethoscope, BookOpen } from "lucide-react"

import { useAppSelector } from "@/store/hook"
import { ALL_NAV_ITEMS, NAVIGATION_ROUTES } from "@/constants/constants"

interface AppSidebarProps {
  mobileOpen: boolean
}

const AppSidebar = ({ mobileOpen }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const user = useAppSelector((state) => state.userData)

  const navItems = ALL_NAV_ITEMS.filter(
    (item) => !item.canAccess || item.canAccess(user)
  )

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out md:relative md:z-auto md:translate-x-0 md:transition-[width,transform] ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "md:w-14" : "md:w-56"}`}
    >
      {/* Brand */}
      <NavLink
        to="/dashboard"
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
      </NavLink>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-md px-2 py-2 text-sm transition-colors ${
                collapsed ? "md:justify-center" : "gap-3"
              } ${
                isActive
                  ? "bg-sidebar-primary/15 font-semibold text-sidebar-primary ring-1 ring-sidebar-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`
            }
          >
            <item.icon className="size-4 shrink-0" />
            <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* How it works */}
      <div className="border-t border-sidebar-border px-2 py-2">
        <Link
          to={NAVIGATION_ROUTES.GUIDE}
          title="How it works"
          className={`flex items-center rounded-md px-2 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
            collapsed ? "md:justify-center" : "gap-3"
          }`}
        >
          <BookOpen className="size-4 shrink-0" />
          <span className={collapsed ? "md:hidden" : ""}>How it works</span>
        </Link>
      </div>

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
  )
}

export default AppSidebar
