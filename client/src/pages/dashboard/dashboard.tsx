import { useMemo } from "react"
import {
  Clock,
  Stethoscope,
  CheckCircle2,
  XCircle,
  Users,
  FileText,
  ClipboardList,
  CalendarDays,
  TrendingUp,
  UserCog,
} from "lucide-react"
import { useAppSelector } from "@/store/hook"
import { useGetDashboardStatsQuery } from "@/store/api/dashboard-api-slice"
import { UserType, Designation } from "@/types/api.types"
import { cn } from "@/lib/utils"
import { getGreeting, formatTodayDate } from "@/utils/helpers"
import type { StatCardProps } from "./dashboard.types"

const StatCard = ({
  label,
  value,
  description,
  icon: Icon,
  iconBg,
  iconColor,
  loading,
}: StatCardProps) => {
  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="h-4 w-28 rounded-lg bg-muted" />
            <div className="h-10 w-14 rounded-lg bg-muted" />
            <div className="h-3 w-36 rounded-lg bg-muted" />
          </div>
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums">
            {value}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className={cn("shrink-0 rounded-2xl p-3", iconBg)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const user = useAppSelector((state) => state.userData)
  const { data, isLoading } = useGetDashboardStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  })
  const stats = data?.result

  const isChemist =
    user.userType === UserType.Staff && user.designation === Designation.Chemist
  const isDoctor = user.userType === UserType.Doctor

  const visitCards = useMemo(
    () => [
      {
        label: "Waiting",
        value: stats?.waitingVisits ?? 0,
        description: "Patients yet to be seen",
        icon: Clock,
        iconBg: "bg-amber-100 dark:bg-amber-900/30",
        iconColor: "text-amber-600 dark:text-amber-400",
      },
      {
        label: "In Consultation",
        value: stats?.inConsultationVisits ?? 0,
        description: "Currently with the doctor",
        icon: Stethoscope,
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
      },
      {
        label: "Completed Today",
        value: stats?.completedVisits ?? 0,
        description: "Consultations closed today",
        icon: CheckCircle2,
        iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
        iconColor: "text-emerald-600 dark:text-emerald-400",
      },
      {
        label: "Cancelled Today",
        value: stats?.cancelledVisits ?? 0,
        description: "Visits cancelled today",
        icon: XCircle,
        iconBg: "bg-rose-100 dark:bg-rose-900/30",
        iconColor: "text-rose-600 dark:text-rose-400",
      },
    ],
    [stats]
  )

  const chemistCards = useMemo(
    () => [
      {
        label: "Today's Prescriptions",
        value: stats?.todayPrescriptions ?? 0,
        description: "Prescriptions issued today",
        icon: FileText,
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
      },
      {
        label: "Total Prescriptions",
        value: stats?.totalPrescriptions ?? 0,
        description: "All-time prescriptions issued",
        icon: ClipboardList,
        iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
        iconColor: "text-emerald-600 dark:text-emerald-400",
      },
      {
        label: "Total Patients",
        value: stats?.totalPatients ?? 0,
        description: "Active registered patients",
        icon: Users,
        iconBg: "bg-violet-100 dark:bg-violet-900/30",
        iconColor: "text-violet-600 dark:text-violet-400",
      },
    ],
    [stats]
  )

  return (
    <div className="max-w-7xl space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {user.firstName}!
        </h2>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          {formatTodayDate()}
        </p>
      </div>

      {/* Overview section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
            Overview
          </h3>
          <span className="text-sm text-muted-foreground">
            {isChemist ? "— Pharmacy summary" : "— Today's clinic activity"}
          </span>
        </div>

        {isChemist ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chemistCards.map((card) => (
              <StatCard key={card.label} {...card} loading={isLoading} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visitCards.map((card) => (
                <StatCard key={card.label} {...card} loading={isLoading} />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Patients"
                value={stats?.totalPatients ?? 0}
                description="Active registered patients"
                icon={Users}
                iconBg="bg-violet-100 dark:bg-violet-900/30"
                iconColor="text-violet-600 dark:text-violet-400"
                loading={isLoading}
              />
              {isDoctor && (
                <StatCard
                  label="Team Members"
                  value={stats?.totalStaff ?? 0}
                  description="Active staff in your clinic"
                  icon={UserCog}
                  iconBg="bg-sky-100 dark:bg-sky-900/30"
                  iconColor="text-sky-600 dark:text-sky-400"
                  loading={isLoading}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
