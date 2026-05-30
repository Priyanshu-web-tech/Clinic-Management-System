import { LogOut, Menu, UserRound } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useLocation, useNavigate } from "react-router-dom"

import { useAppSelector } from "@/store/hook"
import { getInitials } from "@/utils/helpers"
import { NAVIGATION_ROUTES, USER_TYPE_LABEL, DESIGNATION_LABEL } from "@/constants/constants"
import { UserType } from "@/types/api.types"
import { buildCrumbs } from "@/utils/breadcrumbs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface AppHeaderProps {
  onMenuOpen: () => void
  onLogout: () => void
}

const AppHeader = ({ onMenuOpen, onLogout }: AppHeaderProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector((state) => state.userData)
  const initials = getInitials(user.firstName, user.lastName)
  const crumbs = buildCrumbs(location.pathname)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-3">
        <button
          className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
          onClick={onMenuOpen}
        >
          <Menu className="size-4" />
        </button>

        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, i) => (
              <BreadcrumbItem key={i}>
                {i > 0 && <BreadcrumbSeparator />}
                {crumb.href ? (
                  <BreadcrumbLink
                    href={crumb.href}
                    onClick={(e) => { e.preventDefault(); navigate(crumb.href!) }}
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="hidden text-xs font-medium text-muted-foreground sm:block">
          {user.userType === UserType.Staff && user.designation
            ? (DESIGNATION_LABEL[user.designation] ?? user.designation)
            : (USER_TYPE_LABEL[user.userType] ?? user.userType)}
        </span>

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
              className="z-50 min-w-40 animate-in overflow-hidden rounded-lg border border-border bg-card p-1 shadow-md fade-in-0 zoom-in-95"
            >
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {user.email}
                </p>
              </div>

              <DropdownMenu.Separator className="my-1 h-px bg-border" />

              <DropdownMenu.Item
                onSelect={() => navigate(NAVIGATION_ROUTES.PROFILE)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground"
              >
                <UserRound className="size-3.5" />
                Profile
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-1 h-px bg-border" />

              <DropdownMenu.Item
                onSelect={onLogout}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-destructive transition-colors outline-none hover:bg-destructive/10 data-highlighted:bg-destructive/10"
              >
                <LogOut className="size-3.5" />
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}

export default AppHeader
