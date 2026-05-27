import { useState } from "react"
import { format, parseISO } from "date-fns"
import { ChevronDown, ChevronRight, Search } from "lucide-react"

import { useGetPrescriptionsQuery } from "@/store/api/prescription-api-slice"
import { MEDICINE_TIMING_LABEL, DURATION_UNIT_LABEL } from "@/constants/constants"
import type { Prescription } from "@/types/api.types"

import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"

const MedicineList = ({ medicines }: { medicines: Prescription["medicines"] }) => (
  <div className="mt-2 overflow-hidden rounded-md border border-border bg-muted/20">
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
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
          className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-border px-3 py-2 text-xs last:border-b-0"
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
            <p className="text-muted-foreground">Patient</p>
            <p className="font-semibold text-sm">
              {prescription.patient.firstName} {prescription.patient.lastName}
            </p>
            <p className="font-mono text-muted-foreground">{prescription.patient.patientCode}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Doctor</p>
            <p className="font-medium">
              Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
            </p>
          </div>
          {visit && (
            <div>
              <p className="text-muted-foreground">Visit</p>
              <p className="font-mono font-medium">{visit.visitNumber}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium">{format(parseISO(prescription.createdAt), "dd MMM yyyy, hh:mm a")}</p>
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
  const [date, setDate] = useState<string | null>(null)
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (searchTimer) clearTimeout(searchTimer)
    const t = setTimeout(() => setDebouncedSearch(value), 400)
    setSearchTimer(t)
  }

  const { data, isLoading } = useGetPrescriptionsQuery({
    search: debouncedSearch || undefined,
    date: date || undefined,
    pageSize: 50,
  })

  const prescriptions = data?.result?.data ?? []

  return (
    <div className="flex h-full flex-col gap-5 p-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search patient…"
            className="h-9 pl-8 text-xs"
          />
        </div>
        <DatePicker
          value={date}
          onChange={(val) => setDate(val)}
          placeholder="Filter by date"
          maxDate={new Date(9999, 11, 31)}
        />
        {date && (
          <button
            type="button"
            onClick={() => setDate(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear date
          </button>
        )}
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
        <div className="flex flex-col gap-3 overflow-auto">
          {prescriptions.map((p) => (
            <PrescriptionCard key={p._id} prescription={p} />
          ))}
          {data?.result?.total !== undefined && data.result.total > 50 && (
            <p className="text-center text-xs text-muted-foreground">
              Showing first 50 of {data.result.total} prescriptions.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default Prescriptions
