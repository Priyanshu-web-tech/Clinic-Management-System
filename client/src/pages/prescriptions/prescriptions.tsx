import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { ChevronDown, ChevronRight, ClipboardList, Search } from "lucide-react"

import { useGetPrescriptionsQuery } from "@/store/api/prescription-api-slice"
import { MEDICINE_TIMING_LABEL, DURATION_UNIT_LABEL, PAGE_SIZE } from "@/constants/constants"
import type { Prescription } from "@/types/api.types"
import usePaginatedQuery from "@/hooks/use-paginated-query"

import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import Pagination from "@/components/pagination"

const todayString = () => new Date().toISOString().substring(0, 10)

const MedicineList = ({ medicines }: { medicines: Prescription["medicines"] }) => (
  <div className="mt-2 overflow-hidden rounded-md border border-border bg-muted/20">
    <div className="grid grid-cols-[1fr_110px_90px_80px] border-b border-border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      <span>Medicine</span>
      <span>Frequency</span>
      <span>Timing</span>
      <span>Duration</span>
    </div>
    {medicines.map((m, i) => {
      const slots = (["morning", "afternoon", "night"] as const)
        .filter((s) => m.frequency[s] > 0)
        .map((s) => `${s.charAt(0).toUpperCase()}:${m.frequency[s]}`)
      return (
        <div
          key={i}
          className="grid grid-cols-[1fr_110px_90px_80px] items-center border-b border-border px-3 py-2 text-xs last:border-b-0"
        >
          <span className="font-medium">{m.medicineName}</span>
          <span className="text-muted-foreground">{slots.join(" · ") || "—"}</span>
          <span className="text-muted-foreground">{MEDICINE_TIMING_LABEL[m.timing]}</span>
          <span className="whitespace-nowrap text-muted-foreground">
            {m.durationValue} {DURATION_UNIT_LABEL[m.durationUnit]}
          </span>
        </div>
      )
    })}
  </div>
)

const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => {
  const [expanded, setExpanded] = useState(false)
  const visit = typeof prescription.visit === "object" ? prescription.visit : null

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-accent/30"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="mt-0.5 text-muted-foreground">
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-1 text-xs">
          <div>
            <p className="text-muted-foreground">Patient Name</p>
            <p className="font-semibold text-sm">
              {prescription.patient.firstName} {prescription.patient.lastName}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Patient Code</p>
            <p className="font-mono font-medium">{prescription.patient.patientCode}</p>
          </div>
          {visit && (
            <div>
              <p className="text-muted-foreground">Visit</p>
              <p className="font-mono font-medium">{visit.visitNumber}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Time</p>
            <p className="font-medium">{format(parseISO(prescription.createdAt), "hh:mm a")}</p>
          </div>
          <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">
            {prescription.medicines.length} {prescription.medicines.length === 1 ? "medicine" : "medicines"}
          </Badge>
        </div>
      </button>

      {expanded && prescription.medicines.length > 0 && (
        <div className="px-4 pb-4">
          <MedicineList medicines={prescription.medicines} />
        </div>
      )}
      {expanded && prescription.medicines.length === 0 && (
        <p className="px-4 pb-4 text-xs text-muted-foreground">No medicines in this prescription.</p>
      )}
    </div>
  )
}

const Prescriptions = () => {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [date, setDate] = useState(todayString())

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const {
    items: prescriptions,
    page,
    setPage,
    total,
    totalPages,
    isLoading,
  } = usePaginatedQuery<Prescription, { search?: string; date: string }>(
    useGetPrescriptionsQuery,
    { search: debouncedSearch || undefined, date },
    PAGE_SIZE
  )

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardList className="size-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Prescriptions</h2>
            <p className="text-xs text-muted-foreground">
              {total} {total === 1 ? "prescription" : "prescriptions"} today
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
            placeholder="Search patient…"
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
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="size-5" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No prescriptions found.
        </div>
      ) : (
        <div className="mt-5 flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
          {prescriptions.map((p) => (
            <PrescriptionCard key={p._id} prescription={p} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  )
}

export default Prescriptions
