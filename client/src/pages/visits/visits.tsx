import { useState, useEffect } from "react"
import { toast } from "sonner"
import { CalendarCheck, ExternalLink, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAppSelector } from "@/store/hook"
import { UserType } from "@/types/api.types"

import {
  useGetVisitsQuery,
  useUpdateVisitStatusMutation,
} from "@/store/api/visit-api-slice"
import {
  VISITS_TABLE_COLUMNS,
  PAGE_SIZE,
  VISIT_STATUS_OPTIONS,
  VISIT_STATUS_LABEL,
  VISIT_STATUS_BADGE_VARIANT,
} from "@/constants/constants"
import type { Visit, VisitStatus } from "@/types/api.types"
import { VisitStatus as VS } from "@/types/api.types"

import usePaginatedQuery from "@/hooks/use-paginated-query"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import DeleteConfirmDialog from "@/components/delete-confirm-dialog"

const todayString = () => new Date().toISOString().substring(0, 10)

const Visits = () => {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<VisitStatus | "active" | "">("active")
  const [date, setDate] = useState(todayString())

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const [cancelTarget, setCancelTarget] = useState<Visit | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)

  const navigate = useNavigate()
  const currentUser = useAppSelector((state) => state.userData)
  const canManage =
    currentUser.userType === UserType.Admin || currentUser.userType === UserType.Doctor

  const {
    items: visits,
    page,
    setPage,
    total,
    totalPages,
    isLoading,
  } = usePaginatedQuery<Visit, { search?: string; status?: VisitStatus | "active"; date?: string }>(
    useGetVisitsQuery,
    {
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      date,
    },
    PAGE_SIZE,
  )

  const [updateStatus, { isLoading: isUpdating }] = useUpdateVisitStatusMutation()

  // ── Handlers ─────────────────────────────────────────────

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return
    try {
      const res = await updateStatus({ id: cancelTarget._id, status: VS.Cancelled }).unwrap()
      toast.success(res.message ?? "Visit cancelled.")
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to cancel visit."
      toast.error(message)
    } finally {
      setCancelOpen(false)
      setCancelTarget(null)
    }
  }

  // ── Table rows ───────────────────────────────────────────

  const rows = visits.map((visit) => ({
    id: visit._id,
    data: [
      <span className="font-mono text-sm font-semibold text-primary">
        #{visit.tokenNumber}
      </span>,
      <span className="font-mono text-xs text-muted-foreground">
        {visit.visitNumber}
      </span>,
      <div>
        <p className="text-sm font-medium">
          {visit.patient.firstName} {visit.patient.lastName}
        </p>
        <p className="text-xs text-muted-foreground">{visit.patient.patientCode}</p>
      </div>,
      <span className="max-w-[160px] truncate text-xs text-muted-foreground">
        {visit.symptoms || <span className="text-border">—</span>}
      </span>,
      <Badge variant={VISIT_STATUS_BADGE_VARIANT[visit.status] ?? "outline"} className="capitalize">
        {VISIT_STATUS_LABEL[visit.status] ?? visit.status}
      </Badge>,
      <div className="flex items-center justify-end gap-1.5">
        {canManage && visit.status === VS.Waiting && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs"
            disabled={isUpdating}
            onClick={async () => {
              try {
                await updateStatus({ id: visit._id, status: VS.InConsultation }).unwrap()
                navigate(`/visits/${visit._id}`)
              } catch (err: unknown) {
                const message =
                  (err as { data?: { message?: string } })?.data?.message ??
                  "Failed to start visit."
                toast.error(message)
              }
            }}
          >
            Start
          </Button>
        )}
        {canManage && visit.status === VS.InConsultation && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 px-2.5 text-xs"
            onClick={() => navigate(`/visits/${visit._id}`)}
          >
            <ExternalLink className="size-3" />
            Open
          </Button>
        )}
        {(visit.status === VS.Waiting || visit.status === VS.InConsultation) && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            disabled={isUpdating}
            onClick={() => {
              setCancelTarget(visit)
              setCancelOpen(true)
            }}
          >
            Cancel
          </Button>
        )}
      </div>,
    ],
  }))

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <CalendarCheck className="size-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Visits</h2>
            <p className="text-xs text-muted-foreground">
              {total} {total === 1 ? "visit" : "visits"} today
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm min-w-48 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 pl-8 text-xs"
            placeholder="Search by patient name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-40">
          <DatePicker
            value={date}
            onChange={(val) => setDate(val ?? todayString())}
            maxDate={new Date(9999, 11, 31)}
            clearable={false}
          />
        </div>
        <div className="w-44">
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) =>
              setStatusFilter(v === "all" ? "" : (v as VisitStatus | "active"))
            }
          >
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active only</SelectItem>
              <SelectItem value="all">All statuses</SelectItem>
              {VISIT_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={VISITS_TABLE_COLUMNS}
        rows={rows}
        isLoading={isLoading}
        fallbackMessage="No visits found for this date."
        className="mt-5"
      />

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* Cancel Confirmation */}
      <DeleteConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancelConfirm}
        isLoading={isUpdating}
        title="Cancel Visit"
        confirmLabel="Cancel Visit"
        description={
          <>
            Are you sure you want to cancel the visit for{" "}
            <span className="font-medium text-foreground">
              {cancelTarget?.patient.firstName} {cancelTarget?.patient.lastName}
            </span>
            ?
          </>
        }
      />
    </div>
  )
}

export default Visits
